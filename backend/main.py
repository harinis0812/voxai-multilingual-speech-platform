"""
Gnani AI Voice Services - FastAPI Application
=============================================
Provides unified REST API for:
- Speech-to-Text (STT) via Gnani Prisma v3.0
- Text-to-Speech (TTS) via Gnani Timbre v3.0
"""

from typing import Optional
import os
from fastapi import FastAPI, File, UploadFile, Form, status, Response, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from backend import config
from backend.services import stt_service, tts_service

app = FastAPI(
    title="Gnani AI Voice Services API",
    description="Unified FastAPI integration for Gnani AI Speech-to-Text (Prisma v3.0) and Text-to-Speech (Timbre v3.0).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local development and authorized cross-origin requests
is_wildcard = "*" in config.CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if is_wildcard else config.CORS_ORIGINS,
    allow_credentials=not is_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================================================================
# PYDANTIC SCHEMAS
# ==============================================================================
class TTSRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Text content to synthesize into speech.",
        json_schema_extra={"example": "வணக்கம்! ஞானி ஏஐயின் குரல் சேவைக்கு நல்வரவு."}
    )
    voice: Optional[str] = Field(
        default=config.TTS_DEFAULT_VOICE,
        description=f"Voice persona name. Supported: {', '.join(config.TTS_SUPPORTED_VOICES)}",
        json_schema_extra={"example": "Lakshmi"}
    )
    language: Optional[str] = Field(
        default=config.TTS_DEFAULT_LANGUAGE,
        description="Language code (e.g., 'ta-IN', 'en-IN', 'hi-IN', 'ml-IN').",
        json_schema_extra={"example": "ta-IN"}
    )
    speed: Optional[float] = Field(
        default=1.0,
        ge=0.5,
        le=2.0,
        description="Playback speed multiplier (0.5 to 2.0).",
        json_schema_extra={"example": 1.0}
    )


class STTResponse(BaseModel):
    success: bool
    transcript: str
    requested_language_code: Optional[str] = None
    detected_language_code: Optional[str] = None
    model: str
    processing_time: Optional[float] = None
    end_to_end_latency: Optional[float] = None
    request_id: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    api_key_configured: bool
    services: dict


# ==============================================================================
# ENDPOINTS
# ==============================================================================
@app.get("/", summary="API Root & Information")
def root(request: Request):
    """
    Redirects browser visitors to /app/ when the compiled frontend build is present.
    Returns welcome information and documentation links for API clients.
    """
    accept_header = request.headers.get("accept", "")
    frontend_dist_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
    if os.path.exists(frontend_dist_path) and "text/html" in accept_header:
        return RedirectResponse(url="/app/", status_code=status.HTTP_307_TEMPORARY_REDIRECT)

    return {
        "message": "Welcome to Gnani AI Voice Services API",
        "version": "1.0.0",
        "documentation": "/docs",
        "app_ui": "/app",
        "endpoints": {
            "health": {
                "path": "/health",
                "method": "GET",
                "description": "Application health check"
            },
            "speech_to_text": {
                "path": "/api/stt",
                "method": "POST",
                "description": "Convert speech audio to text using Prisma v3.0",
                "content_type": "multipart/form-data",
                "max_duration_seconds": config.STT_MAX_DURATION_SECONDS
            },
            "text_to_speech": {
                "path": "/api/tts",
                "method": "POST",
                "description": "Synthesize speech from text using Timbre v3.0",
                "content_type": "application/json",
                "supported_voices": config.TTS_SUPPORTED_VOICES
            }
        }
    }


@app.get("/health", response_model=HealthResponse, summary="Health Check")
def health_check():
    """
    Checks backend service status and configuration without making external network calls.
    """
    return {
        "status": "healthy",
        "api_key_configured": config.is_api_key_configured(),
        "services": {
            "stt": "ready",
            "tts": "ready"
        }
    }


@app.post(
    "/api/stt",
    response_model=STTResponse,
    status_code=status.HTTP_200_OK,
    summary="Speech-to-Text (Prisma v3.0)"
)
async def speech_to_text(
    file: UploadFile = File(..., description="Audio file to transcribe (WAV recommended, max 30s)"),
    language_code: Optional[str] = Form(
        default=config.STT_DEFAULT_LANGUAGE,
        description="Target language code (e.g., 'ta-IN', 'en-IN', 'indic-auto')"
    )
):
    """
    Receives an uploaded audio file and transcribes it using Gnani AI Prisma v3.0.
    """
    file_bytes = await file.read()
    filename = file.filename or "recording.wav"

    result = stt_service.transcribe_audio(
        file_bytes=file_bytes,
        filename=filename,
        language_code=language_code
    )
    return result


@app.post(
    "/api/tts",
    status_code=status.HTTP_200_OK,
    summary="Text-to-Speech (Timbre v3.0)",
    responses={
        200: {
            "content": {"audio/wav": {}},
            "description": "Returns synthesized WAV audio stream."
        }
    }
)
def text_to_speech(request: TTSRequest):
    """
    Receives text input and returns synthesized speech audio generated by Gnani Timbre v3.0.
    """
    audio_bytes = tts_service.synthesize_speech(
        text=request.text,
        voice=request.voice or config.TTS_DEFAULT_VOICE,
        language=request.language or config.TTS_DEFAULT_LANGUAGE,
        speed=request.speed or 1.0
    )

    return Response(
        content=audio_bytes,
        media_type="audio/wav",
        headers={
            "Content-Disposition": "attachment; filename=synthesized_speech.wav",
            "Content-Type": "audio/wav"
        }
    )


@app.get(
    "/api/samples/{sample_name}",
    summary="Retrieve Reference Benchmark Audio",
    responses={
        200: {
            "content": {"audio/wav": {}},
            "description": "Returns verified audio sample WAV stream."
        }
    }
)
def get_sample_audio(sample_name: str):
    """
    Returns verified benchmark audio samples for Hindi, Malayalam, Tamil, English, or the original recording.
    """
    base_dir = os.path.dirname(os.path.dirname(__file__))
    sample_map = {
        "hindi": os.path.join(base_dir, "verified_audio", "hindi_avinash.wav"),
        "malayalam": os.path.join(base_dir, "verified_audio", "malayalam_lakshmi.wav"),
        "tamil": os.path.join(base_dir, "verified_audio", "tamil_lakshmi.wav"),
        "english": os.path.join(base_dir, "verified_audio", "english_shivani.wav"),
        "recording": os.path.join(base_dir, "recording.wav")
    }

    file_path = sample_map.get(sample_name.lower())
    if not file_path or not os.path.exists(file_path):
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample audio '{sample_name}' not found."
        )

    with open(file_path, "rb") as f:
        content = f.read()

    return Response(
        content=content,
        media_type="audio/wav",
        headers={
            "Content-Disposition": f"attachment; filename={sample_name}_sample.wav",
            "Content-Type": "audio/wav"
        }
    )


# ==============================================================================
# STATIC FRONTEND MOUNT (IF COMPILED SPA IS PRESENT)
# ==============================================================================
frontend_dist_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist_path):
    app.mount("/app", StaticFiles(directory=frontend_dist_path, html=True), name="frontend")

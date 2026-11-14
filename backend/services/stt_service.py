"""
Speech-to-Text (STT) Service module.
Handles validation, duration calculation, and HTTP communication with Gnani Prisma v3.0 API.
"""

import io
import wave
import json
import struct
import requests
from fastapi import HTTPException, status
from backend import config


def check_audio_duration(file_bytes: bytes) -> float | None:
    """
    Inspects in-memory WAV bytes using Python's standard `wave` module.
    Returns duration in seconds, or None if the audio cannot be parsed as PCM WAV.
    Handles streaming WAV headers (0xFFFFFFFF) by normalizing chunk sizes and bounding frame counts.
    """
    try:
        data = bytearray(file_bytes)
        if len(data) >= 44 and data[:4] == b"RIFF" and data[8:12] == b"WAVE":
            riff_size = struct.unpack("<I", data[4:8])[0]
            data_chunk_pos = data.find(b"data", 12)
            if data_chunk_pos != -1 and (data_chunk_pos + 8) <= len(data):
                data_size = struct.unpack("<I", data[data_chunk_pos + 4: data_chunk_pos + 8])[0]
                if riff_size == 0xFFFFFFFF or data_size == 0xFFFFFFFF:
                    actual_data_size = len(data) - (data_chunk_pos + 8)
                    actual_riff_size = len(data) - 8
                    data[4:8] = struct.pack("<I", actual_riff_size)
                    data[data_chunk_pos + 4: data_chunk_pos + 8] = struct.pack("<I", actual_data_size)
                    file_bytes = bytes(data)

        with wave.open(io.BytesIO(file_bytes), "rb") as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            channels = wf.getnchannels()
            sampwidth = wf.getsampwidth()
            frame_size = channels * sampwidth
            if rate > 0 and frame_size > 0:
                max_possible_frames = (len(file_bytes) - 44) // frame_size
                if frames > max_possible_frames:
                    frames = max_possible_frames
                return frames / float(rate)
    except Exception:
        return None
    return None


def parse_gnani_error(response: requests.Response) -> str:
    """
    Safely extracts error details from Gnani AI response body.
    """
    try:
        err_json = response.json()
        if isinstance(err_json, dict):
            detail_obj = err_json.get("detail")
            if isinstance(detail_obj, dict):
                msg = detail_obj.get("message") or detail_obj.get("error") or detail_obj.get("reason")
                code = detail_obj.get("error_code")
                if msg and code:
                    return f"{msg} (Code: {code})"
                if msg:
                    return str(msg)
                return json.dumps(detail_obj, ensure_ascii=False)
            elif isinstance(detail_obj, str):
                return detail_obj

            code = err_json.get("error_code")
            msg = err_json.get("message") or err_json.get("error") or err_json.get("detail")
            if code and msg:
                return f"{msg} (Code: {code})"
            if msg:
                return str(msg)
            return json.dumps(err_json, ensure_ascii=False)
        return str(err_json)
    except Exception:
        return response.text.strip() or "No error details returned by external service."


def transcribe_audio(file_bytes: bytes, filename: str = "audio.wav", language_code: str = config.STT_DEFAULT_LANGUAGE) -> dict:
    """
    Transcribes audio bytes using the official Gnani AI Vachana STT API (Prisma v3.0).

    Args:
        file_bytes: Raw binary bytes of the audio file.
        filename: Original or default audio filename.
        language_code: Target language code (e.g., "ta-IN", "en-IN", "indic-auto").

    Returns:
        dict containing transcription and metadata.

    Raises:
        HTTPException for validation or external API errors.
    """
    api_key = config.get_api_key()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gnani AI API key is not configured on the server. Please check .env settings."
        )

    # 1. Validate file size
    if not file_bytes or len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded audio file is empty (0 bytes)."
        )

    # 2. Validate duration
    duration = check_audio_duration(file_bytes)
    if duration is not None:
        if duration > config.STT_MAX_DURATION_SECONDS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Audio duration ({duration:.2f}s) exceeds the maximum limit of {config.STT_MAX_DURATION_SECONDS} seconds."
            )

    # 3. Construct headers and multipart payload
    headers = {
        "X-API-Key-ID": api_key
    }

    form_data = {
        "model": config.STT_MODEL_NAME,
        "language_code": language_code or config.STT_DEFAULT_LANGUAGE
    }

    files = {
        "audio_file": (filename, file_bytes, "audio/wav")
    }

    # 4. Perform POST request
    try:
        response = requests.post(
            url=config.STT_API_URL,
            headers=headers,
            data=form_data,
            files=files,
            timeout=config.STT_TIMEOUT_SECONDS
        )
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Gnani STT API request timed out (did not respond within {config.STT_TIMEOUT_SECONDS} seconds)."
        )
    except requests.exceptions.ConnectionError as e:
        err_str = str(e).lower()
        if "timed out" in err_str:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Network transfer timed out while uploading audio to Gnani AI."
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to connect to Gnani AI STT service: {str(e)}"
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Network error communicating with Gnani AI: {str(e)}"
        )

    # 5. Handle HTTP Status Codes
    if response.status_code == 200:
        try:
            result = response.json()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Invalid JSON response received from Gnani AI STT service."
            )

        transcript = result.get("transcript", "")
        return {
            "success": True,
            "transcript": transcript,
            "requested_language_code": language_code or config.STT_DEFAULT_LANGUAGE,
            "detected_language_code": result.get("detected_language_code", language_code),
            "model": result.get("model", config.STT_MODEL_NAME),
            "processing_time": result.get("processing_time"),
            "end_to_end_latency": result.get("end_to_end_latency"),
            "request_id": result.get("request_id")
        }

    err_detail = parse_gnani_error(response)

    if response.status_code == 400:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Bad request: {err_detail}")
    elif response.status_code == 401:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Unauthorized: {err_detail}")
    elif response.status_code == 402:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=f"Payment Required: {err_detail}")
    elif response.status_code == 403:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Forbidden: {err_detail}")
    elif response.status_code == 429:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=f"Rate limit exceeded: {err_detail}")
    elif response.status_code >= 500:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Gnani STT server error: {err_detail}")
    else:
        raise HTTPException(status_code=response.status_code, detail=f"STT API error: {err_detail}")

"""
Text-to-Speech (TTS) Service module.
Handles text synthesis and audio normalization using Gnani Timbre v3.0 API.
"""

import json
import struct
import requests
from fastapi import HTTPException, status
from backend import config


def fix_wav_header(audio_bytes: bytearray | bytes) -> bytes:
    """
    Normalizes a streaming WAV header if chunk sizes were transmitted with 0xFFFFFFFF.
    Ensures standard RIFF chunk size and data chunk size match actual file size.
    """
    data = bytearray(audio_bytes)
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
    return bytes(data)


def detect_text_language(text: str) -> str | None:
    """
    Infers language code from Unicode script ranges.
    Returns None if script cannot be determined.
    """
    for ch in text:
        code = ord(ch)
        if 0x0900 <= code <= 0x097F:
            return "hi-IN"
        elif 0x0B80 <= code <= 0x0BFF:
            return "ta-IN"
        elif 0x0C00 <= code <= 0x0C7F:
            return "te-IN"
        elif 0x0C80 <= code <= 0x0CFF:
            return "kn-IN"
        elif 0x0D00 <= code <= 0x0D7F:
            return "ml-IN"
        elif 0x0980 <= code <= 0x09FF:
            return "bn-IN"
        elif 0x0A80 <= code <= 0x0AFF:
            return "gu-IN"
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


def synthesize_speech(
    text: str,
    voice: str = config.TTS_DEFAULT_VOICE,
    language: str = config.TTS_DEFAULT_LANGUAGE,
    speed: float = 1.0
) -> bytes:
    """
    Synthesizes speech audio from text using Gnani Timbre v3.0 REST API.

    Args:
        text: Input text string.
        voice: Voice persona name (e.g., "Lakshmi", "Shivani", "Avinash").
        language: Target language code (e.g., "ta-IN", "en-IN", "hi-IN").
        speed: Playback speed multiplier (default: 1.0).

    Returns:
        Clean binary bytes of WAV audio file.

    Raises:
        HTTPException for validation or external API errors.
    """
    api_key = config.get_api_key()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gnani AI API key is not configured on the server. Please check .env settings."
        )

    # 1. Validate text input
    clean_text = text.strip() if text else ""
    if not clean_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text input cannot be empty."
        )

    # 2. Intelligent script alignment
    # If language was defaulted to 'ta-IN' but text is written in another Indic script (e.g. Devanagari),
    # align target_language to the detected script to prevent phoneme mismatch.
    target_language = language or config.TTS_DEFAULT_LANGUAGE
    detected_lang = detect_text_language(clean_text)
    if detected_lang and (not language or (language == config.TTS_DEFAULT_LANGUAGE and detected_lang != config.TTS_DEFAULT_LANGUAGE)):
        target_language = detected_lang

    # 3. Construct payload and headers
    headers = {
        "X-API-Key-ID": api_key,
        "Content-Type": "application/json"
    }

    payload = {
        "text": clean_text,
        "voice": voice or config.TTS_DEFAULT_VOICE,
        "model": config.TTS_MODEL_NAME,
        "language": target_language,
        "speed": float(speed) if speed else 1.0,
        "audio_config": config.TTS_AUDIO_CONFIG
    }

    # 3. Perform POST request
    try:
        response = requests.post(
            url=config.TTS_API_URL,
            headers=headers,
            json=payload,
            timeout=config.TTS_TIMEOUT_SECONDS
        )
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Gnani TTS API request timed out (did not respond within {config.TTS_TIMEOUT_SECONDS} seconds)."
        )
    except requests.exceptions.ConnectionError as e:
        err_str = str(e).lower()
        if "timed out" in err_str:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Network transfer timed out communicating with Gnani TTS."
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to connect to Gnani AI TTS service: {str(e)}"
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Network error communicating with Gnani AI: {str(e)}"
        )

    # 4. Handle HTTP Status Codes
    if response.status_code == 200:
        raw_audio = response.content
        if not raw_audio:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Received empty audio payload from Gnani TTS service."
            )
        return fix_wav_header(raw_audio)

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
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Gnani TTS server error: {err_detail}")
    else:
        raise HTTPException(status_code=response.status_code, detail=f"TTS API error: {err_detail}")

"""
Gnani AI - Text-to-Speech (TTS) API Test Script (Timbre v3.0)
=============================================================
This script integrates with the official Gnani AI Timbre TTS REST API
(https://api.vachana.ai/api/v1/tts/inference) to synthesize speech from text.

Features:
- Secure authentication using X-API-Key-ID from .env (never leaks API key).
- Supports official timbre-v3.0 model with validated Indian voice personas.
- Formats audio output into clean, fully-compliant PCM WAV container.
- Comprehensive HTTP & JSON error handling with user-friendly diagnostics.
- Audio file validation (checks size, channels, sample rate, and duration).
"""

import os
import sys
import json
import struct
import wave
import time
import requests
from dotenv import load_dotenv

# ==============================================================================
# CONFIGURATION SETTINGS
# ==============================================================================
API_URL = "https://api.vachana.ai/api/v1/tts/inference"
MODEL_NAME = "timbre-v3.0"

# Target Language and Voice selection
# Supported voices for timbre-v3.0:
#   Lakshmi, Kalpana, Avinash, Shivani, Shubham, Prakash,
#   Devansh, Yashraj, Chetana, Vasudha, Harshad, Riyaa, Tarika
LANGUAGE_CODE = "ta-IN"  # Examples: "ta-IN" (Tamil), "en-IN" (Indian English), "hi-IN" (Hindi)
VOICE_NAME = "Lakshmi"    # e.g., "Lakshmi" (Female, Tamil/Indic), "Shivani" (Female), "Avinash" (Male)

# Default text to synthesize if none provided
DEFAULT_SAMPLE_TEXT = "வணக்கம்! ஞானி ஏஐயின் டிம்பர் உரை-ஒலி மாற்ற சோதனை வெற்றிகரமாக இயங்குகிறது."

# Output filename
OUTPUT_AUDIO_FILE = "generated_speech.wav"

# Request timeout in seconds
REQUEST_TIMEOUT = 60

# Audio configuration options
AUDIO_CONFIG = {
    "encoding": "linear_pcm",
    "container": "wav",
    "sample_rate": 48000,
    "num_channels": 1,
    "sample_width": 2
}


def fix_wav_header(audio_bytes: bytearray | bytes) -> bytearray:
    """
    Normalizes a streaming WAV header if chunk sizes were transmitted with 0xFFFFFFFF.
    Ensures standard RIFF chunk size and data chunk size match actual file size.
    """
    data = bytearray(audio_bytes)
    if len(data) >= 44 and data[:4] == b"RIFF" and data[8:12] == b"WAVE":
        # Check if RIFF chunk size is 0xFFFFFFFF
        riff_size = struct.unpack("<I", data[4:8])[0]
        data_chunk_pos = data.find(b"data", 12)
        if data_chunk_pos != -1 and (data_chunk_pos + 8) <= len(data):
            data_size = struct.unpack("<I", data[data_chunk_pos + 4: data_chunk_pos + 8])[0]
            if riff_size == 0xFFFFFFFF or data_size == 0xFFFFFFFF:
                actual_data_size = len(data) - (data_chunk_pos + 8)
                actual_riff_size = len(data) - 8
                data[4:8] = struct.pack("<I", actual_riff_size)
                data[data_chunk_pos + 4: data_chunk_pos + 8] = struct.pack("<I", actual_data_size)
    return data


def parse_response_error(response: requests.Response) -> str:
    """
    Safely extracts error details from an HTTP response without throwing exceptions.
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

            error_code = err_json.get("error_code")
            message = err_json.get("message") or err_json.get("error") or err_json.get("detail")
            if error_code and message:
                return f"{message} (Code: {error_code})"
            if message:
                return str(message)
            return json.dumps(err_json, ensure_ascii=False)
        return str(err_json)
    except Exception:
        return response.text.strip() or "No additional error details provided."


def validate_generated_audio(file_path: str) -> dict | None:
    """
    Validates that the saved audio file is a readable WAV file and extracts metadata.
    """
    if not os.path.exists(file_path):
        return None

    file_size = os.path.getsize(file_path)
    if file_size == 0:
        return None

    try:
        with wave.open(file_path, "rb") as wf:
            channels = wf.getnchannels()
            sampwidth = wf.getsampwidth()
            framerate = wf.getframerate()
            frames = wf.getnframes()
            duration = frames / float(framerate) if framerate > 0 else 0.0
            return {
                "file_size": file_size,
                "channels": channels,
                "sample_width_bits": sampwidth * 8,
                "sample_rate": framerate,
                "frames": frames,
                "duration_seconds": duration
            }
    except Exception:
        return {"file_size": file_size, "channels": 1, "sample_rate": 48000, "duration_seconds": None}


def synthesize_speech(
    text: str,
    output_path: str = OUTPUT_AUDIO_FILE,
    voice: str = VOICE_NAME,
    language: str = LANGUAGE_CODE,
    model: str = MODEL_NAME,
    speed: float = 1.0
) -> bool:
    """
    Calls Gnani Timbre TTS API and writes synthesized audio to output_path.
    """
    load_dotenv()
    api_key = os.getenv("GNANI_API_KEY", "").strip()

    if not api_key:
        print("\n[ERROR] Missing API Key!")
        print(" -> 'GNANI_API_KEY' is not set in your .env file.")
        print(" -> Open .env and add your key: GNANI_API_KEY=your_actual_api_key_here")
        print(" -> Save the file and rerun this script.\n")
        return False

    if not text or not text.strip():
        print("\n[ERROR] Empty text input!")
        print(" -> Text to synthesize cannot be empty.\n")
        return False

    print("=" * 60)
    print(" Gnani AI Text-to-Speech (Timbre API / timbre-v3.0) Test")
    print("=" * 60)
    print("[✓] API key successfully loaded from .env (hidden for security)")
    print(f"[✓] Input text: \"{text.strip()}\"")

    headers = {
        "X-API-Key-ID": api_key,
        "Content-Type": "application/json"
    }

    payload = {
        "text": text.strip(),
        "voice": voice,
        "model": model,
        "language": language,
        "speed": speed,
        "audio_config": AUDIO_CONFIG
    }

    print("\n--- Request Details ---")
    print(f"Endpoint:      {API_URL}")
    print(f"HTTP Method:   POST")
    print(f"Model:         {model}")
    print(f"Voice:         {voice}")
    print(f"Language:      {language}")
    print(f"Speed:         {speed}x")
    print(f"Audio Format:  {AUDIO_CONFIG['container']} ({AUDIO_CONFIG['sample_rate']} Hz, {AUDIO_CONFIG['encoding']})")
    print("Header:        X-API-Key-ID: [PROTECTED]")
    print(f"Timeout:       {REQUEST_TIMEOUT}s")
    print("-----------------------\n")
    print("Sending text to Gnani AI Timbre for synthesis...")

    start_time = time.time()
    try:
        response = requests.post(
            url=API_URL,
            headers=headers,
            json=payload,
            timeout=REQUEST_TIMEOUT
        )
    except requests.exceptions.Timeout:
        print("\n[ERROR] Request timed out!")
        print(f" -> The Gnani server did not respond within {REQUEST_TIMEOUT} seconds.")
        return False
    except requests.exceptions.ConnectionError as conn_err:
        print("\n[ERROR] Connection error!")
        print(f" -> Could not connect to {API_URL}.")
        print(" -> Please check your network connection, DNS, or firewall settings.")
        return False
    except requests.exceptions.RequestException as e:
        print(f"\n[ERROR] An unexpected network error occurred: {e}")
        return False

    elapsed_time = time.time() - start_time
    status_code = response.status_code
    print(f"HTTP Status Code: {status_code}")

    if status_code == 200:
        content_type = response.headers.get("Content-Type", "")
        raw_audio = response.content

        if not raw_audio:
            print("\n[ERROR] Received 200 OK but response audio body is empty!")
            return False

        # Normalize streaming WAV header if necessary
        clean_audio = fix_wav_header(raw_audio)

        # Save to disk
        try:
            with open(output_path, "wb") as f:
                f.write(clean_audio)
        except IOError as e:
            print(f"\n[ERROR] Failed to write audio file to '{output_path}': {e}")
            return False

        print("\n" + "=" * 60)
        print(" SPEECH SYNTHESIS SUCCESSFUL")
        print("=" * 60)
        print(f"[✓] Audio saved to:  {output_path}")
        print(f"[✓] Content-Type:    {content_type}")
        print(f"[✓] Synthesis Time:  {elapsed_time:.2f}s")

        # Validate the generated audio file
        audio_info = validate_generated_audio(output_path)
        if audio_info:
            print("\n--- Audio File Verification ---")
            print(f"File Size:     {audio_info['file_size']:,} bytes")
            print(f"Channels:      {audio_info['channels']} (Mono)" if audio_info['channels'] == 1 else f"Channels: {audio_info['channels']}")
            print(f"Sample Rate:   {audio_info['sample_rate']} Hz")
            if audio_info.get("sample_width_bits"):
                print(f"Sample Width:  {audio_info['sample_width_bits']}-bit")
            if audio_info.get("duration_seconds") is not None:
                print(f"Duration:      {audio_info['duration_seconds']:.2f} seconds")
            print("Status:        [VALID AUDIO FILE]")
            print("-------------------------------\n")
        return True

    # Error diagnostics
    error_detail = parse_response_error(response)
    print("\n" + "!" * 60)
    print(" TTS API REQUEST FAILED")
    print("!" * 60)

    if status_code == 400:
        print(f"[Error 400: Bad Request]")
        print(" -> Invalid input parameters (check voice name, model, language, or text).")
        print(f" -> Server message: {error_detail}")
    elif status_code == 401:
        print(f"[Error 401: Unauthorized]")
        print(" -> The API key is invalid or unrecognized by Gnani AI.")
        print(f" -> Server message: {error_detail}")
    elif status_code == 402:
        print(f"[Error 402: Payment Required]")
        print(" -> Insufficient credits or unverified account for TTS.")
        print(f" -> Server message: {error_detail}")
    elif status_code == 403:
        print(f"[Error 403: Forbidden]")
        print(" -> Missing TTS permissions or scope (SCOPE_NOT_ALLOWED).")
        print(f" -> Server message: {error_detail}")
    elif status_code == 429:
        print(f"[Error 429: Too Many Requests]")
        print(" -> Rate limit exceeded. Please wait briefly before trying again.")
        print(f" -> Server message: {error_detail}")
    elif status_code == 500:
        print(f"[Error 500: Internal Server Error]")
        print(" -> Gnani AI server encountered an error while synthesizing speech.")
        print(f" -> Server message: {error_detail}")
    elif status_code == 504:
        print(f"[Error 504: Gateway Timeout]")
        print(" -> The upstream server timed out while generating speech.")
        print(f" -> Server message: {error_detail}")
    else:
        print(f"[Error {status_code}]")
        print(f" -> Server message: {error_detail}")

    print("!" * 60 + "\n")
    return False


def main():
    # If custom text passed via CLI, use it; otherwise use sample text
    text_to_synthesize = " ".join(sys.argv[1:]).strip() if len(sys.argv) > 1 else DEFAULT_SAMPLE_TEXT
    success = synthesize_speech(text=text_to_synthesize)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

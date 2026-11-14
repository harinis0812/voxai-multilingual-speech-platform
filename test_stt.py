"""
Gnani AI - Speech-to-Text (STT) API Test Script (Prisma v3.0)
=============================================================
This script demonstrates how to integrate with the Gnani AI Vachana STT API
using the Prisma v3.0 model via HTTP POST multipart/form-data.

Features:
- Secure environment configuration via python-dotenv (never leaks API key).
- Pre-flight checks: ensures audio file and API key exist and are non-empty.
- Duration check: verifies audio is within the official 30-second limit.
- Resilient network timeout settings (handles large audio upload + model inference).
- Comprehensive HTTP & JSON error handling with user-friendly diagnostics.
"""

import os
import sys
import wave
import json
import requests
from dotenv import load_dotenv

# ==============================================================================
# CONFIGURATION SETTINGS
# ==============================================================================
API_URL = "https://api.vachana.ai/stt/v3"
MODEL_NAME = "prisma-v3.0"

# Target language for transcription.
# Supported options:
#   "ta-IN"      -> Tamil (India) [Default]
#   "en-IN"      -> Indian English (To test English, change this value to "en-IN")
#   "indic-auto" -> Auto-detect Indian language or code-mixed speech
#   "hi-IN"      -> Hindi (India)
#   "kn-IN"      -> Kannada (India)
#   "te-IN"      -> Telugu (India)
#   "mr-IN"      -> Marathi (India)
LANGUAGE_CODE = "ta-IN"

# Path to the input audio file
AUDIO_FILE_PATH = "recording.wav"

# Request timeout in seconds (Connect, Write & Read timeout)
# 90 seconds provides sufficient window for uploading ~2.5 MB audio + inference latency.
REQUEST_TIMEOUT = 90

# Maximum supported audio duration in seconds for short-clip REST API
MAX_AUDIO_DURATION_SECONDS = 30.0


def check_wav_duration(file_path: str) -> float | None:
    """
    Checks the duration of a WAV file using Python's standard `wave` module.
    Returns duration in seconds, or None if the file cannot be parsed by `wave`.
    """
    try:
        with wave.open(file_path, "rb") as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            if rate > 0:
                return frames / float(rate)
    except Exception:
        # File might be non-PCM or another audio format wrapped in .wav
        return None
    return None


def parse_response_error(response: requests.Response) -> str:
    """
    Safely extracts error details from an HTTP response without throwing exceptions.
    Handles nested error dictionaries such as {"detail": {"message": ..., "error_code": ...}}.
    """
    try:
        err_json = response.json()
        if isinstance(err_json, dict):
            # Check if details are nested under 'detail'
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


def main():
    print("=" * 60)
    print(" Gnani AI Speech-to-Text (Vachana API v3 / Prisma v3.0) Test")
    print("=" * 60)

    # --------------------------------------------------------------------------
    # Step 1: Load environment variables and validate API Key
    # --------------------------------------------------------------------------
    load_dotenv()
    api_key = os.getenv("GNANI_API_KEY", "").strip()

    if not api_key:
        print("\n[ERROR] Missing API Key!")
        print(" -> 'GNANI_API_KEY' is not set in your .env file.")
        print(" -> Open .env and add your key: GNANI_API_KEY=your_actual_api_key_here")
        print(" -> Save the file and rerun this script.\n")
        sys.exit(1)
        return

    print("[✓] API key successfully loaded from .env (hidden for security)")

    # --------------------------------------------------------------------------
    # Step 2: Validate Audio File existence and size
    # --------------------------------------------------------------------------
    if not os.path.exists(AUDIO_FILE_PATH):
        print(f"\n[ERROR] Audio file not found: '{AUDIO_FILE_PATH}'")
        print(f" -> Please place a valid audio file named '{AUDIO_FILE_PATH}' in the project directory.\n")
        sys.exit(1)
        return

    file_size_bytes = os.path.getsize(AUDIO_FILE_PATH)
    if file_size_bytes == 0:
        print(f"\n[ERROR] Audio file '{AUDIO_FILE_PATH}' is empty (0 bytes)!")
        print(" -> The Gnani AI API cannot process an empty audio file.")
        print(" -> Please record or copy a real WAV audio file (30 seconds or less) into 'recording.wav'.")
        print(" -> Once replaced, run this script again.\n")
        sys.exit(1)
        return

    print(f"[✓] Audio file located: '{AUDIO_FILE_PATH}' ({file_size_bytes:,} bytes)")

    # --------------------------------------------------------------------------
    # Step 3: Validate Audio Duration (Max 30 seconds limit)
    # --------------------------------------------------------------------------
    duration = check_wav_duration(AUDIO_FILE_PATH)
    if duration is not None:
        print(f"[✓] Audio duration: {duration:.2f} seconds")
        if duration > MAX_AUDIO_DURATION_SECONDS:
            print(f"\n[ERROR] Audio duration exceeds the 30-second API limit!")
            print(f" -> Current duration: {duration:.2f}s (Maximum allowed: {MAX_AUDIO_DURATION_SECONDS}s)")
            print(" -> Please trim or replace 'recording.wav' with a clip under 30 seconds.\n")
            sys.exit(1)
            return
    else:
        print(f"[i] Note: Could not determine exact duration via standard WAV parser.")
        print(f"    Please ensure '{AUDIO_FILE_PATH}' is 30 seconds or less as per Gnani AI limits.")

    # --------------------------------------------------------------------------
    # Step 4: Prepare Request Headers and Multipart/Form-Data Payload
    # --------------------------------------------------------------------------
    # Note: requests automatically configures 'Content-Type: multipart/form-data'
    # with the appropriate boundary when 'files' is passed.
    headers = {
        "X-API-Key-ID": api_key
    }

    form_data = {
        "model": MODEL_NAME,
        "language_code": LANGUAGE_CODE
    }

    print("\n--- Request Details ---")
    print(f"Endpoint:      {API_URL}")
    print(f"HTTP Method:   POST")
    print(f"Model:         {MODEL_NAME}")
    print(f"Language Code: {LANGUAGE_CODE}")
    print("Header:        X-API-Key-ID: [PROTECTED]")
    print(f"Timeout:       {REQUEST_TIMEOUT}s")
    print("-----------------------\n")
    print("Sending audio to Gnani AI (uploading data & waiting for transcription)...")

    # --------------------------------------------------------------------------
    # Step 5: Send Request and Handle Errors
    # --------------------------------------------------------------------------
    try:
        with open(AUDIO_FILE_PATH, "rb") as audio_file:
            files = {
                "audio_file": (os.path.basename(AUDIO_FILE_PATH), audio_file, "audio/wav")
            }
            response = requests.post(
                url=API_URL,
                headers=headers,
                data=form_data,
                files=files,
                timeout=REQUEST_TIMEOUT
            )

    except requests.exceptions.Timeout:
        print("\n[ERROR] Request timed out!")
        print(f" -> The request did not complete within {REQUEST_TIMEOUT} seconds.")
        print(" -> Please check your network speed or try again.")
        sys.exit(1)
        return

    except requests.exceptions.ConnectionError as conn_err:
        err_msg = str(conn_err)
        print("\n[ERROR] Connection error!")
        if "timed out" in err_msg.lower() or "timeout" in err_msg.lower():
            print(" -> Socket transfer timed out during data upload or connection establishment.")
            print(" -> The network upload took longer than allowed or was interrupted.")
        else:
            print(" -> Could not establish connection to https://api.vachana.ai.")
        print(" -> Please check your internet connection, DNS, or firewall settings.")
        sys.exit(1)
        return

    except requests.exceptions.RequestException as e:
        print(f"\n[ERROR] An unexpected network error occurred: {e}")
        sys.exit(1)
        return

    # --------------------------------------------------------------------------
    # Step 6: Process Response and Status Codes
    # --------------------------------------------------------------------------
    status_code = response.status_code
    print(f"HTTP Status Code: {status_code}")

    if status_code == 200:
        # Success: Parse JSON response safely
        try:
            result = response.json()
        except Exception:
            print("\n[ERROR] Received invalid JSON response from server:")
            print(response.text)
            sys.exit(1)

        print("\n" + "=" * 60)
        print(" TRANSCRIPTION SUCCESSFUL")
        print("=" * 60)

        # Extract transcription and metadata safely without guessing fields
        transcript = result.get("transcript")
        detected_lang = result.get("detected_language_code")
        model_used = result.get("model", MODEL_NAME)
        request_id = result.get("request_id")
        processing_time = result.get("processing_time")
        e2e_latency = result.get("end_to_end_latency")

        if transcript is not None:
            print(f"\n[Transcription Result]:\n{transcript}\n")
        else:
            print("\n[Notice] 'transcript' field not found in response. Full JSON response:")
            print(json.dumps(result, indent=2, ensure_ascii=False))

        print("--- Metadata ---")
        if detected_lang:
            print(f"Detected Language:   {detected_lang}")
        if model_used:
            print(f"Model:               {model_used}")
        if processing_time is not None:
            print(f"Processing Time:     {processing_time:.2f}s" if isinstance(processing_time, (int, float)) else f"Processing Time:     {processing_time}")
        if e2e_latency is not None:
            print(f"End-to-End Latency:  {e2e_latency:.2f}s" if isinstance(e2e_latency, (int, float)) else f"End-to-End Latency:  {e2e_latency}")
        if request_id:
            print(f"Request ID:          {request_id}")
        print("----------------\n")
        return

    # Specific HTTP Error Code Handling
    error_detail = parse_response_error(response)

    print("\n" + "!" * 60)
    print(" API REQUEST FAILED")
    print("!" * 60)

    if status_code == 400:
        print(f"[Error 400: Bad Request]")
        print(" -> The request was invalid. Check if the model or language code is valid.")
        print(f" -> Server message: {error_detail}")

    elif status_code == 401:
        print(f"[Error 401: Unauthorized]")
        print(" -> The API key is invalid or unrecognized by Gnani AI.")
        print(" -> Please verify your GNANI_API_KEY in the .env file.")
        print(f" -> Server message: {error_detail}")

    elif status_code == 402:
        print(f"[Error 402: Payment Required]")
        print(" -> Your Gnani AI account has insufficient credits or is unverified.")
        print(" -> Please check your subscription or credit balance on the Gnani AI portal.")
        print(f" -> Server message: {error_detail}")

    elif status_code == 403:
        print(f"[Error 403: Forbidden]")
        print(" -> Missing permissions/scope (SCOPE_NOT_ALLOWED).")
        print(" -> Your API key does not have access permissions for the Speech-to-Text service.")
        print(f" -> Server message: {error_detail}")

    elif status_code == 429:
        print(f"[Error 429: Too Many Requests]")
        print(" -> Rate limit exceeded. Too many concurrent or recent requests.")
        print(" -> Please pause briefly before submitting another request.")
        print(f" -> Server message: {error_detail}")

    elif status_code == 500:
        print(f"[Error 500: Internal Server Error]")
        print(" -> The Gnani AI server encountered an unexpected error while processing the audio.")
        print(f" -> Server message: {error_detail}")

    elif status_code == 504:
        print(f"[Error 504: Gateway Timeout]")
        print(" -> The upstream server timed out while processing your audio.")
        print(f" -> Server message: {error_detail}")

    else:
        print(f"[Error {status_code}]")
        print(f" -> Server message: {error_detail}")

    print("!" * 60 + "\n")
    sys.exit(1)


if __name__ == "__main__":
    main()

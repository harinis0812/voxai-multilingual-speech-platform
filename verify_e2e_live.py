"""
Live End-to-End API Verification Script
=======================================
Tests the complete FastAPI pipeline against live Gnani AI servers:
1. Audio File -> POST /api/stt -> stt_service -> Gnani Prisma v3.0 -> JSON response
2. Text Input -> POST /api/tts -> tts_service -> Gnani Timbre v3.0 -> WAV audio response
"""

import os
import sys
import wave
import time
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_live_stt():
    print("=" * 65)
    print(" 1. TESTING LIVE SPEECH-TO-TEXT THROUGH FASTAPI (POST /api/stt)")
    print("=" * 65)

    audio_path = "recording.wav"
    if not os.path.exists(audio_path):
        print(f"[FAIL] Audio file '{audio_path}' not found!")
        return False

    with open(audio_path, "rb") as f:
        audio_bytes = f.read()

    print(f"[✓] Uploading '{audio_path}' ({len(audio_bytes):,} bytes) to /api/stt...")
    t0 = time.time()
    response = client.post(
        "/api/stt",
        files={"file": (os.path.basename(audio_path), audio_bytes, "audio/wav")},
        data={"language_code": "ta-IN"}
    )
    elapsed = time.time() - t0

    print(f"HTTP Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"[✓] Transcription received in {elapsed:.2f}s:")
        print(f"\n\"{data.get('transcript')}\"\n")
        print(f"Model:            {data.get('model')}")
        print(f"Detected Lang:    {data.get('detected_language_code')}")
        print(f"Processing Time:  {data.get('processing_time')}s")
        print(f"End-to-End:       {data.get('end_to_end_latency')}s")
        print(f"Request ID:       {data.get('request_id')}")
        return True
    else:
        print(f"[FAIL] /api/stt returned error: {response.text}")
        return False


def test_live_tts():
    print("\n" + "=" * 65)
    print(" 2. TESTING LIVE TEXT-TO-SPEECH THROUGH FASTAPI (POST /api/tts)")
    print("=" * 65)

    sample_text = "வணக்கம்! ஞானி ஏஐயின் குரல் சேவை ஃபாஸ்ட் ஏபிஐ வழியாக வெற்றிகரமாக இயங்குகிறது."
    payload = {
        "text": sample_text,
        "voice": "Lakshmi",
        "language": "ta-IN",
        "speed": 1.0
    }

    print(f"[✓] Requesting speech synthesis for text:")
    print(f"    \"{sample_text}\"")
    t0 = time.time()
    response = client.post("/api/tts", json=payload)
    elapsed = time.time() - t0

    print(f"HTTP Status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type')}")

    if response.status_code == 200:
        audio_bytes = response.content
        print(f"[✓] Received {len(audio_bytes):,} bytes of audio in {elapsed:.2f}s.")

        # Save to disk to verify audio properties
        output_file = "fastapi_live_output.wav"
        with open(output_file, "wb") as f:
            f.write(audio_bytes)

        with wave.open(output_file, "rb") as wf:
            channels = wf.getnchannels()
            rate = wf.getframerate()
            frames = wf.getnframes()
            duration = frames / float(rate)
            print(f"[✓] Verified audio file '{output_file}':")
            print(f"    Channels:     {channels} (Mono)")
            print(f"    Sample Rate:  {rate} Hz")
            print(f"    Duration:     {duration:.2f} seconds")

        return True
    else:
        print(f"[FAIL] /api/tts returned error: {response.text}")
        return False


if __name__ == "__main__":
    stt_ok = test_live_stt()
    tts_ok = test_live_tts()

    print("\n" + "=" * 65)
    print(f" LIVE PIPELINE SUMMARY: STT={'PASSED' if stt_ok else 'FAILED'} | TTS={'PASSED' if tts_ok else 'FAILED'}")
    print("=" * 65)
    sys.exit(0 if (stt_ok and tts_ok) else 1)

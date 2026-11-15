"""
Configuration settings for Gnani AI Backend.
Loads environment variables and defines constants for STT and TTS services.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Gnani AI API Key
GNANI_API_KEY = os.getenv("GNANI_API_KEY", "").strip()

# Speech-to-Text (STT) Settings
STT_API_URL = "https://api.vachana.ai/stt/v3"
STT_MODEL_NAME = "prisma-v3.0"
STT_DEFAULT_LANGUAGE = "ta-IN"
STT_MAX_DURATION_SECONDS = 30.0
STT_TIMEOUT_SECONDS = 90

# Text-to-Speech (TTS) Settings
TTS_API_URL = "https://api.vachana.ai/api/v1/tts/inference"
TTS_MODEL_NAME = "timbre-v3.0"
TTS_DEFAULT_LANGUAGE = "ta-IN"
TTS_DEFAULT_VOICE = "Lakshmi"
TTS_TIMEOUT_SECONDS = 60

# Supported voices for timbre-v3.0
TTS_SUPPORTED_VOICES = [
    "Lakshmi",
    "Kalpana",
    "Avinash",
    "Shivani",
    "Shubham",
    "Prakash",
    "Devansh",
    "Yashraj",
    "Chetana",
    "Vasudha",
    "Harshad",
    "Riyaa",
    "Tarika"
]

# Audio Synthesis Configuration
TTS_AUDIO_CONFIG = {
    "encoding": "linear_pcm",
    "container": "wav",
    "sample_rate": 48000,
    "num_channels": 1,
    "sample_width": 2
}

# Allowed CORS Origins
# In production unified deployment, frontend is same-origin (/app).
# For local development or decoupled hosting, origins can be customized via ALLOWED_ORIGINS env var.
RAW_CORS_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000"
).strip()
CORS_ORIGINS = [orig.strip() for orig in RAW_CORS_ORIGINS.split(",") if orig.strip()]


def get_api_key() -> str:
    """
    Returns the loaded API key or reloads it if missing.
    Never prints or logs the key.
    """
    global GNANI_API_KEY
    if not GNANI_API_KEY:
        load_dotenv(override=True)
        GNANI_API_KEY = os.getenv("GNANI_API_KEY", "").strip()
    return GNANI_API_KEY


def is_api_key_configured() -> bool:
    """Checks whether a non-empty API key is configured."""
    return bool(get_api_key())

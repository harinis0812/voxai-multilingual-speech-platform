"""
Backend Integration & Unit Tests for FastAPI Application
=========================================================
Tests covered:
1. Root endpoint (GET /)
2. Health check endpoint (GET /health)
3. STT endpoint (POST /api/stt) with mocked success
4. STT endpoint with empty file (400)
5. STT endpoint with audio exceeding 30 seconds (400)
6. TTS endpoint (POST /api/tts) with mocked success
7. TTS endpoint with empty text (400)
8. External API error propagation (401, 402, 429, 500)
9. Missing API key handling (500)
"""

import io
import wave
import struct
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def make_dummy_wav(duration_seconds: float = 2.0, sample_rate: int = 16000) -> bytes:
    """Generates an in-memory valid PCM WAV file."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        num_frames = int(duration_seconds * sample_rate)
        wf.writeframes(b"\x00\x00" * num_frames)
    return buf.getvalue()


# ==============================================================================
# 1. CORE ENDPOINT TESTS
# ==============================================================================
def test_root_endpoint():
    """Verify root endpoint returns welcome and documentation links."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Welcome to Gnani AI" in data["message"]
    assert "/docs" in data["documentation"]
    assert "speech_to_text" in data["endpoints"]
    assert "text_to_speech" in data["endpoints"]


def test_health_endpoint():
    """Verify health endpoint returns status without making external calls."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "api_key_configured" in data
    assert data["services"]["stt"] == "ready"
    assert data["services"]["tts"] == "ready"


# ==============================================================================
# 2. SPEECH-TO-TEXT (STT) TESTS
# ==============================================================================
@patch("requests.post")
def test_stt_successful_mock(mock_post):
    """Test successful audio transcription via POST /api/stt."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "success": True,
        "transcript": "வணக்கம் இது மாதிரி சோதனை உரை",
        "model": "prisma-v3.0",
        "detected_language_code": "ta-IN",
        "processing_time": 0.45,
        "end_to_end_latency": 3.8,
        "request_id": "mock-req-1234"
    }
    mock_post.return_value = mock_resp

    wav_bytes = make_dummy_wav(duration_seconds=5.0)

    with patch("backend.config.get_api_key", return_value="mock_api_key"):
        response = client.post(
            "/api/stt",
            files={"file": ("test.wav", wav_bytes, "audio/wav")},
            data={"language_code": "ta-IN"}
        )

    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["transcript"] == "வணக்கம் இது மாதிரி சோதனை உரை"
    assert res_data["model"] == "prisma-v3.0"
    assert res_data["detected_language_code"] == "ta-IN"


def test_stt_empty_audio_file():
    """Test STT endpoint rejects empty 0-byte file."""
    with patch("backend.config.get_api_key", return_value="mock_api_key"):
        response = client.post(
            "/api/stt",
            files={"file": ("empty.wav", b"", "audio/wav")}
        )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_stt_audio_exceeding_30s():
    """Test STT endpoint rejects audio exceeding 30-second limit."""
    long_wav_bytes = make_dummy_wav(duration_seconds=35.0)

    with patch("backend.config.get_api_key", return_value="mock_api_key"):
        response = client.post(
            "/api/stt",
            files={"file": ("long.wav", long_wav_bytes, "audio/wav")}
        )
    assert response.status_code == 400
    assert "exceeds" in response.json()["detail"].lower()


# ==============================================================================
# 3. TEXT-TO-SPEECH (TTS) TESTS
# ==============================================================================
@patch("requests.post")
def test_tts_successful_mock(mock_post):
    """Test successful speech synthesis via POST /api/tts."""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.headers = {"Content-Type": "audio/wav"}

    dummy_audio = make_dummy_wav(duration_seconds=1.5)
    mock_resp.content = dummy_audio
    mock_post.return_value = mock_resp

    payload = {
        "text": "வணக்கம், இது சோதனை உரை.",
        "voice": "Lakshmi",
        "language": "ta-IN",
        "speed": 1.0
    }

    with patch("backend.config.get_api_key", return_value="mock_api_key"):
        response = client.post("/api/tts", json=payload)

    assert response.status_code == 200
    assert response.headers["Content-Type"] == "audio/wav"
    assert len(response.content) > 0


def test_tts_empty_text():
    """Test TTS endpoint rejects empty string input."""
    with patch("backend.config.get_api_key", return_value="mock_api_key"):
        response = client.post("/api/tts", json={"text": ""})
    assert response.status_code == 422 or response.status_code == 400


def test_tts_whitespace_text():
    """Test TTS endpoint rejects whitespace-only text."""
    with patch("backend.config.get_api_key", return_value="mock_api_key"):
        response = client.post("/api/tts", json={"text": "    "})
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


# ==============================================================================
# 4. EXTERNAL ERROR PROPAGATION TESTS
# ==============================================================================
@patch("requests.post")
def test_external_401_unauthorized(mock_post):
    """Test 401 Unauthorized from Gnani AI is propagated as 401."""
    mock_resp = MagicMock()
    mock_resp.status_code = 401
    mock_resp.json.return_value = {"detail": {"error_code": "INVALID_API_KEY", "message": "Unauthorized"}}
    mock_post.return_value = mock_resp

    with patch("backend.config.get_api_key", return_value="bad_key"):
        response = client.post("/api/tts", json={"text": "Test"})
    assert response.status_code == 401
    assert "Unauthorized" in response.json()["detail"]


@patch("requests.post")
def test_external_402_payment_required(mock_post):
    """Test 402 Payment Required from Gnani AI is propagated as 402."""
    mock_resp = MagicMock()
    mock_resp.status_code = 402
    mock_resp.json.return_value = {"detail": {"error_code": "INSUFFICIENT_CREDITS", "message": "Payment Required"}}
    mock_post.return_value = mock_resp

    with patch("backend.config.get_api_key", return_value="mock_key"):
        response = client.post("/api/tts", json={"text": "Test"})
    assert response.status_code == 402
    assert "Payment Required" in response.json()["detail"]


@patch("requests.post")
def test_external_429_rate_limit(mock_post):
    """Test 429 Rate Limit from Gnani AI is propagated as 429."""
    mock_resp = MagicMock()
    mock_resp.status_code = 429
    mock_resp.json.return_value = {"detail": {"error_code": "RATE_LIMITED", "message": "Too Many Requests"}}
    mock_post.return_value = mock_resp

    with patch("backend.config.get_api_key", return_value="mock_key"):
        response = client.post("/api/tts", json={"text": "Test"})
    assert response.status_code == 429
    assert "Rate limit" in response.json()["detail"]


@patch("requests.post")
def test_external_403_forbidden(mock_post):
    """Test 403 Forbidden (SCOPE_NOT_ALLOWED) is propagated as 403."""
    mock_resp = MagicMock()
    mock_resp.status_code = 403
    mock_resp.json.return_value = {"detail": {"error_code": "SCOPE_NOT_ALLOWED", "message": "Forbidden"}}
    mock_post.return_value = mock_resp

    with patch("backend.config.get_api_key", return_value="mock_key"):
        response = client.post("/api/tts", json={"text": "Test"})
    assert response.status_code == 403
    assert "Forbidden" in response.json()["detail"]


@patch("requests.post")
def test_external_504_timeout(mock_post):
    """Test external API timeout results in 504 Gateway Timeout."""
    import requests
    mock_post.side_effect = requests.exceptions.Timeout("Request timed out")

    with patch("backend.config.get_api_key", return_value="mock_key"):
        response = client.post("/api/tts", json={"text": "Test"})
    assert response.status_code == 504
    assert "timed out" in response.json()["detail"].lower()


@patch("requests.post")
def test_stt_external_timeout(mock_post):
    """Test external STT API timeout results in 504 Gateway Timeout."""
    import requests
    mock_post.side_effect = requests.exceptions.Timeout("STT timed out")

    wav_bytes = make_dummy_wav(duration_seconds=2.0)
    with patch("backend.config.get_api_key", return_value="mock_key"):
        response = client.post(
            "/api/stt",
            files={"file": ("test.wav", wav_bytes, "audio/wav")}
        )
    assert response.status_code == 504


@patch("requests.post")
def test_external_500_server_error(mock_post):
    """Test 500 from Gnani AI is handled as 502 Bad Gateway."""
    mock_resp = MagicMock()
    mock_resp.status_code = 500
    mock_resp.json.return_value = {"message": "Internal worker error"}
    mock_post.return_value = mock_resp

    with patch("backend.config.get_api_key", return_value="mock_key"):
        response = client.post("/api/tts", json={"text": "Test"})
    assert response.status_code == 502
    assert "error" in response.json()["detail"].lower()


def test_missing_api_key_configuration():
    """Test that missing API key returns 500 configuration error."""
    with patch("backend.config.get_api_key", return_value=""):
        response = client.post("/api/tts", json={"text": "Test text"})
    assert response.status_code == 500
    assert "not configured" in response.json()["detail"]

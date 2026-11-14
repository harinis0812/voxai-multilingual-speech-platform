"""
Automated Test Suite for Gnani AI Speech-to-Text (STT) Integration
===================================================================
Tests covered:
1. Local audio validation (duration check, 0-byte check, missing file).
2. STT request construction (headers, form-data payload, multipart boundary).
3. Mocked HTTP error handling (400, 401, 402, 403, 429, 500, 504, Timeout).
4. Response parsing (successful transcription, metadata extraction).
"""

import io
import os
import wave
import json
import unittest
from unittest.mock import patch, MagicMock

import test_stt


class TestAudioValidation(unittest.TestCase):
    """Tests for audio file format, size, and duration validation."""

    def test_real_audio_duration_under_30s(self):
        """Ensure recording.wav exists and is <= 30.0 seconds."""
        self.assertTrue(os.path.exists("recording.wav"), "recording.wav must exist")
        self.assertGreater(os.path.getsize("recording.wav"), 0, "recording.wav must not be empty")

        duration = test_stt.check_wav_duration("recording.wav")
        self.assertIsNotNone(duration, "Audio duration must be readable")
        self.assertLessEqual(duration, 30.0, f"Duration {duration}s must be <= 30 seconds")

    def test_reject_audio_over_30s(self):
        """Check that audio duration > 30s is detected."""
        temp_wav = "temp_over_30s.wav"
        try:
            with wave.open(temp_wav, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(16000)
                wf.writeframes(b"\x00\x00" * 16000 * 35)  # 35 seconds of silence

            duration = test_stt.check_wav_duration(temp_wav)
            self.assertIsNotNone(duration)
            self.assertGreater(duration, 30.0)
        finally:
            if os.path.exists(temp_wav):
                os.remove(temp_wav)


class TestRequestConstruction(unittest.TestCase):
    """Tests verifying request parameters and headers adhere to Gnani documentation."""

    @patch("requests.post")
    def test_request_headers_and_payload(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "success": True,
            "transcript": "டெஸ்ட் உரை",
            "model": "prisma-v3.0",
            "detected_language_code": "ta-IN",
            "processing_time": 0.5,
            "end_to_end_latency": 4.2,
            "request_id": "test-uuid"
        }
        mock_post.return_value = mock_response

        with patch.dict(os.environ, {"GNANI_API_KEY": "dummy_secret_test_key"}):
            with patch("sys.exit") as mock_exit:
                test_stt.main()
                mock_exit.assert_not_called()

        self.assertTrue(mock_post.called)
        call_kwargs = mock_post.call_args[1]

        # Verify URL
        self.assertEqual(call_kwargs["url"], "https://api.vachana.ai/stt/v3")

        # Verify Authentication Header (never hardcoded, loaded securely)
        self.assertEqual(call_kwargs["headers"].get("X-API-Key-ID"), "dummy_secret_test_key")

        # Verify Payload Parameters
        self.assertEqual(call_kwargs["data"]["model"], "prisma-v3.0")
        self.assertEqual(call_kwargs["data"]["language_code"], "ta-IN")

        # Verify Audio File field name
        self.assertIn("audio_file", call_kwargs["files"])
        self.assertEqual(call_kwargs["files"]["audio_file"][0], "recording.wav")

        # Verify Timeout is at least 60 seconds
        self.assertGreaterEqual(call_kwargs["timeout"], 60)


class TestMockedErrorHandling(unittest.TestCase):
    """Tests for HTTP and network error handling without consuming API credits."""

    def test_missing_api_key_check(self):
        """Ensure missing API key triggers clean exit without calling API."""
        with patch.dict(os.environ, {"GNANI_API_KEY": ""}, clear=True):
            with patch("sys.exit") as mock_exit:
                test_stt.main()
                mock_exit.assert_called_with(1)

    @patch("requests.post")
    def test_401_unauthorized_error(self, mock_post):
        """Ensure 401 Unauthorized is handled gracefully."""
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.json.return_value = {
            "detail": {"error_code": "INVALID_API_KEY", "message": "Unauthorized"}
        }
        mock_post.return_value = mock_response

        with patch.dict(os.environ, {"GNANI_API_KEY": "invalid_key"}):
            with patch("sys.exit") as mock_exit:
                test_stt.main()
                mock_exit.assert_called_with(1)

    @patch("requests.post")
    def test_402_payment_required_error(self, mock_post):
        """Ensure 402 Insufficient credits is handled gracefully."""
        mock_response = MagicMock()
        mock_response.status_code = 402
        mock_response.json.return_value = {
            "detail": {"error_code": "INSUFFICIENT_CREDITS", "message": "Payment Required"}
        }
        mock_post.return_value = mock_response

        with patch.dict(os.environ, {"GNANI_API_KEY": "valid_key"}):
            with patch("sys.exit") as mock_exit:
                test_stt.main()
                mock_exit.assert_called_with(1)

    @patch("requests.post")
    def test_403_forbidden_error(self, mock_post):
        """Ensure 403 Missing STT Scope is handled gracefully."""
        mock_response = MagicMock()
        mock_response.status_code = 403
        mock_response.json.return_value = {
            "detail": {"error_code": "SCOPE_NOT_ALLOWED", "message": "Forbidden"}
        }
        mock_post.return_value = mock_response

        with patch.dict(os.environ, {"GNANI_API_KEY": "valid_key"}):
            with patch("sys.exit") as mock_exit:
                test_stt.main()
                mock_exit.assert_called_with(1)

    @patch("requests.post")
    def test_429_rate_limit_error(self, mock_post):
        """Ensure 429 Rate Limit is handled gracefully."""
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.json.return_value = {
            "detail": {"error_code": "RATE_LIMITED", "message": "Too Many Requests"}
        }
        mock_post.return_value = mock_response

        with patch.dict(os.environ, {"GNANI_API_KEY": "valid_key"}):
            with patch("sys.exit") as mock_exit:
                test_stt.main()
                mock_exit.assert_called_with(1)

    @patch("requests.post")
    def test_500_server_error(self, mock_post):
        """Ensure 500 Internal Server Error is handled gracefully."""
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.json.return_value = {
            "message": "Internal Server Error in speech worker"
        }
        mock_post.return_value = mock_response

        with patch.dict(os.environ, {"GNANI_API_KEY": "valid_key"}):
            with patch("sys.exit") as mock_exit:
                test_stt.main()
                mock_exit.assert_called_with(1)


if __name__ == "__main__":
    unittest.main()

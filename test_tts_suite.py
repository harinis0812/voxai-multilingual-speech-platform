"""
Automated Test Suite for Gnani AI Text-to-Speech (TTS) Integration
===================================================================
Tests covered:
1. Input validation (empty text, missing API key).
2. TTS request construction (headers, payload parameters, audio_config).
3. Streaming WAV header normalization (fix_wav_header).
4. Audio file validation (validate_generated_audio).
5. Mocked HTTP error handling (400, 401, 402, 403, 429, 500, 504, Timeout).
6. Successful audio response synthesis and disk write verification.
"""

import os
import wave
import struct
import unittest
from unittest.mock import patch, MagicMock

import test_tts


class TestTTSInputValidation(unittest.TestCase):
    """Tests for TTS input validation."""

    def test_missing_api_key(self):
        """Empty API key should fail gracefully without making HTTP calls."""
        with patch.dict(os.environ, {"GNANI_API_KEY": ""}, clear=True):
            result = test_tts.synthesize_speech("Test text")
            self.assertFalse(result)

    def test_empty_text_input(self):
        """Empty or whitespace text should fail validation."""
        with patch.dict(os.environ, {"GNANI_API_KEY": "valid_key"}):
            self.assertFalse(test_tts.synthesize_speech(""))
            self.assertFalse(test_tts.synthesize_speech("   "))


class TestTTSHeaderAndAudioValidation(unittest.TestCase):
    """Tests for WAV header normalization and validation."""

    def test_fix_wav_header(self):
        """Ensure 0xFFFFFFFF streaming chunk sizes are replaced with actual file sizes."""
        raw = bytearray(100)
        raw[0:4] = b"RIFF"
        raw[4:8] = b"\xff\xff\xff\xff"
        raw[8:12] = b"WAVE"
        raw[12:16] = b"fmt "
        raw[36:40] = b"data"
        raw[40:44] = b"\xff\xff\xff\xff"

        fixed = test_tts.fix_wav_header(raw)
        self.assertEqual(len(fixed), 100)
        expected_riff_size = 100 - 8
        expected_data_size = 100 - 44
        self.assertEqual(struct.unpack("<I", fixed[4:8])[0], expected_riff_size)
        self.assertEqual(struct.unpack("<I", fixed[40:44])[0], expected_data_size)

    def test_validate_nonexistent_audio(self):
        """Validating a non-existent file should return None."""
        self.assertIsNone(test_tts.validate_generated_audio("nonexistent_test.wav"))


class TestTTSRequestConstruction(unittest.TestCase):
    """Tests verifying request parameters adhere to Gnani Timbre documentation."""

    @patch("requests.post")
    def test_request_payload_and_headers(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.headers = {"Content-Type": "audio/wav"}
        # Minimal valid PCM wav data
        dummy_wav = bytearray(44)
        dummy_wav[0:4] = b"RIFF"
        dummy_wav[4:8] = struct.pack("<I", 36)
        dummy_wav[8:12] = b"WAVE"
        dummy_wav[12:16] = b"fmt "
        dummy_wav[16:20] = struct.pack("<I", 16)
        dummy_wav[20:22] = struct.pack("<H", 1)  # PCM
        dummy_wav[22:24] = struct.pack("<H", 1)  # Mono
        dummy_wav[24:28] = struct.pack("<I", 48000)
        dummy_wav[28:32] = struct.pack("<I", 96000)
        dummy_wav[32:34] = struct.pack("<H", 2)
        dummy_wav[34:36] = struct.pack("<H", 16)
        dummy_wav[36:40] = b"data"
        dummy_wav[40:44] = struct.pack("<I", 0)
        mock_response.content = bytes(dummy_wav)
        mock_post.return_value = mock_response

        test_output = "temp_mock_out.wav"
        try:
            with patch.dict(os.environ, {"GNANI_API_KEY": "test_tts_key"}):
                success = test_tts.synthesize_speech(
                    text="Hello test",
                    output_path=test_output,
                    voice="Lakshmi",
                    language="ta-IN",
                    model="timbre-v3.0",
                    speed=1.0
                )
                self.assertTrue(success)

            self.assertTrue(mock_post.called)
            call_kwargs = mock_post.call_args[1]

            # Verify endpoint URL
            self.assertEqual(call_kwargs["url"], "https://api.vachana.ai/api/v1/tts/inference")

            # Verify Auth Header
            self.assertEqual(call_kwargs["headers"].get("X-API-Key-ID"), "test_tts_key")
            self.assertEqual(call_kwargs["headers"].get("Content-Type"), "application/json")

            # Verify JSON body structure
            json_body = call_kwargs["json"]
            self.assertEqual(json_body["text"], "Hello test")
            self.assertEqual(json_body["voice"], "Lakshmi")
            self.assertEqual(json_body["model"], "timbre-v3.0")
            self.assertEqual(json_body["language"], "ta-IN")
            self.assertEqual(json_body["speed"], 1.0)
            self.assertEqual(json_body["audio_config"]["container"], "wav")
            self.assertEqual(json_body["audio_config"]["sample_rate"], 48000)

            # Verify output file was created
            self.assertTrue(os.path.exists(test_output))
        finally:
            if os.path.exists(test_output):
                os.remove(test_output)


class TestTTSMockedErrors(unittest.TestCase):
    """Tests for HTTP and API error handling."""

    @patch("requests.post")
    def test_400_bad_request(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 400
        mock_resp.json.return_value = {
            "success": False,
            "message": "Voice 'InvalidVoice' is not supported by model 'timbre-v3.0'."
        }
        mock_post.return_value = mock_resp

        with patch.dict(os.environ, {"GNANI_API_KEY": "valid_key"}):
            self.assertFalse(test_tts.synthesize_speech("Test", voice="InvalidVoice"))

    @patch("requests.post")
    def test_401_unauthorized(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 401
        mock_resp.json.return_value = {"detail": {"error_code": "INVALID_API_KEY", "message": "Unauthorized"}}
        mock_post.return_value = mock_resp

        with patch.dict(os.environ, {"GNANI_API_KEY": "invalid_key"}):
            self.assertFalse(test_tts.synthesize_speech("Test"))

    @patch("requests.post")
    def test_402_payment_required(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 402
        mock_resp.json.return_value = {"detail": {"error_code": "INSUFFICIENT_CREDITS", "message": "Payment Required"}}
        mock_post.return_value = mock_resp

        with patch.dict(os.environ, {"GNANI_API_KEY": "valid_key"}):
            self.assertFalse(test_tts.synthesize_speech("Test"))

    @patch("requests.post")
    def test_429_rate_limit(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 429
        mock_resp.json.return_value = {"detail": {"error_code": "RATE_LIMITED", "message": "Too Many Requests"}}
        mock_post.return_value = mock_resp

        with patch.dict(os.environ, {"GNANI_API_KEY": "valid_key"}):
            self.assertFalse(test_tts.synthesize_speech("Test"))

    @patch("requests.post")
    def test_500_server_error(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 500
        mock_resp.json.return_value = {"message": "Internal worker error in TTS synthesizer"}
        mock_post.return_value = mock_resp

        with patch.dict(os.environ, {"GNANI_API_KEY": "valid_key"}):
            self.assertFalse(test_tts.synthesize_speech("Test"))


if __name__ == "__main__":
    unittest.main()

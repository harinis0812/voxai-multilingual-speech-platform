/**
 * Gnani AI API Client
 * Connects frontend directly to the FastAPI backend at http://127.0.0.1:8000
 */

// Use relative paths when served from backend (e.g. /app), or explicit URL when running on Vite dev server (port 5173)
const API_BASE_URL = typeof window !== "undefined" && window.location.port === "5173"
  ? "http://127.0.0.1:8000"
  : "";

/**
 * Checks backend health and service readiness.
 */
export async function fetchHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with HTTP ${response.status}`);
  }
  return await response.json();
}

/**
 * Transcribes audio file using Gnani Prisma v3.0 via POST /api/stt.
 * @param {File} audioFile - The audio file to upload.
 * @param {string} languageCode - Target language code (e.g. 'ta-IN', 'en-IN').
 */
export async function transcribeAudio(audioFile, languageCode = "ta-IN") {
  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("language_code", languageCode);

  const response = await fetch(`${API_BASE_URL}/api/stt`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || `Transcription failed with HTTP ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Synthesizes text into speech using Gnani Timbre v3.0 via POST /api/tts.
 * @param {string} text - Input text to synthesize.
 * @param {string} voice - Voice persona name (e.g. 'Lakshmi', 'Shivani').
 * @param {string} language - Language code (e.g. 'ta-IN', 'en-IN').
 * @param {number} speed - Playback speed multiplier (0.5 to 2.0).
 * @returns {Promise<Blob>} - Returns binary WAV audio blob.
 */
export async function synthesizeSpeech(text, voice = "Lakshmi", language = "ta-IN", speed = 1.0) {
  const response = await fetch(`${API_BASE_URL}/api/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      voice,
      language,
      speed: parseFloat(speed),
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errorMsg = errData.detail || `Speech synthesis failed with HTTP ${response.status}`;
    throw new Error(errorMsg);
  }

  return await response.blob();
}

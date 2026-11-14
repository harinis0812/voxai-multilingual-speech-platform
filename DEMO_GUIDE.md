# Gnani AI Internship Challenge – Demonstration Guide & Presentation Script

This guide provides step-by-step instructions for demonstrating your completed project and includes a **3–5 minute presentation script** ready to be narrated during your final screen recording.

---

## 1. Demonstration Overview & Preparation

### Prerequisites Checklist:
- [x] Python 3.11+ installed.
- [x] Dependencies installed (`pip install -r requirements.txt`).
- [x] `.env` file configured with `GNANI_API_KEY`.
- [x] `recording.wav` present in project root (27.99s Tamil recording).

### Step-by-Step Setup:
1. Open your terminal in the project directory:
   ```powershell
   cd D:\gnani-internship
   ```
2. Start the FastAPI server:
   ```powershell
   uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
   ```
3. (Optional) In a second terminal, start the React + Vite development server:
   ```powershell
   cd frontend
   npm run dev
   ```
4. Open your web browser to:
   - **Modern Web Application (Frontend)**: [http://localhost:5173](http://localhost:5173) (or [http://127.0.0.1:8000/app](http://127.0.0.1:8000/app))
   - **Interactive API Documentation (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **Health Monitor**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 2. Interactive Demonstration Walkthrough (Swagger UI)

### Part A: Backend Health & Status
1. Navigate to `GET /health` in Swagger UI.
2. Click **Try it out** and **Execute**.
3. Point out the response:
   - Status code `200 OK`.
   - `status: "healthy"`.
   - `api_key_configured: true` (Credentials loaded safely without exposing secret keys).
   - `services: {"stt": "ready", "tts": "ready"}`.

### Part B: Speech-to-Text (STT) Demonstration
1. Navigate to `POST /api/stt` in Swagger UI.
2. Click **Try it out**.
3. In the `file` field, click **Choose File** and select `recording.wav` from `D:\gnani-internship`.
4. Leave `language_code` as `ta-IN` (Tamil).
5. Click **Execute**.
6. Display the live transcription received from Gnani AI's Prisma v3.0 model:
   ```json
   {
     "success": true,
     "transcript": "டேக் அ டீப் ப்ரெத் அண்ட் பாஸ் ஃபார் அ மோமெண்ட். \"இன் த ரஷ் ஆஃப் டெய்லி லைஃப், இட் இஸ் ஈஸி டு கெட் காட் அப் இன் எண்ட்லெஸ் டு டூ லிஸ்ட்ஸ், நோட்டிஃபிகேஷன்ஸ் அண்ட் கான்ஸ்டன்ட் நாய்ஸ்.\"...",
     "detected_language_code": "ta-IN",
     "model": "prisma-v3.0",
     "processing_time": 0.50,
     "end_to_end_latency": 12.35
   }
   ```
7. Highlight that duration is validated on the backend to enforce the 30-second API limit.

### Part C: Text-to-Speech (TTS) Demonstration
1. Navigate to `POST /api/tts` in Swagger UI.
2. Click **Try it out**.
3. Enter the following JSON request body:
   ```json
   {
     "text": "வணக்கம்! ஞானி ஏஐயின் குரல் சேவை ஃபாஸ்ட் ஏபிஐ வழியாக வெற்றிகரமாக இயங்குகிறது.",
     "voice": "Lakshmi",
     "language": "ta-IN",
     "speed": 1.0
   }
   ```
4. Click **Execute**.
5. Show the response:
   - Status code `200 OK`.
   - `Content-Type: audio/wav`.
   - In Swagger UI, an audio player automatically appears allowing you to play the synthesized speech directly, or click **Download file** to inspect the 48 kHz mono WAV file.

### Part D: Automated Testing Demonstration
1. Open a second terminal window.
2. Run the automated test suite:
   ```powershell
   python -m pytest -v
   ```
3. Show that all **35 automated tests** pass in under 2 seconds.
4. Explain that automated tests use mocks to protect API credits and enable rapid CI/CD validation.
5. (Optional) Run the live end-to-end integration test:
   ```powershell
   python verify_e2e_live.py
   ```
   Show that live requests against Gnani AI servers return `HTTP 200 OK` for both services.

---

## 3. Recommended 3–5 Minute Presentation Script

Use this script during your video recording. Adjust pacing to stay within 3 to 5 minutes.

---

### [0:00 – 0:45] Introduction & Problem Overview
> *"Hello everyone! My name is [Your Name], and this is my presentation for the Gnani AI Internship Challenge.*
>
> *The goal of this project is to integrate Gnani AI's advanced Indic voice technologies—specifically the **Prisma v3.0 Speech-to-Text** API and the **Timbre v3.0 Text-to-Speech** API—into a unified, robust Python backend built with **FastAPI**.*
>
> *Indian languages have unique phonetic nuances and frequent code-switching. Gnani AI's models are purpose-built to solve these challenges for Indian accents. In this project, I built a modular service architecture that handles audio validation, resolves network upload constraints, and provides a production-ready REST API."*

---

### [0:45 – 1:30] Architecture & Security Highlights
> *(Show project folder in VS Code or IDE)*
>
> *"Let's take a quick look at the architecture:*
> - *Under `backend/`, we have `main.py` which sets up the FastAPI application, CORS, and Pydantic schemas.*
> - *`config.py` securely loads the API key from `.env`. The key is never committed to GitHub or exposed in logs or responses.*
> - *`services/stt_service.py` validates audio files in memory using Python's standard `wave` module, ensuring audio is under the official 30-second limit before uploading to Gnani's Prisma v3.0 REST endpoint.*
> - *`services/tts_service.py` connects to Gnani's Timbre v3.0 endpoint, sending text and returning a normalized 48 kHz PCM WAV audio stream."*

---

### [1:30 – 2:45] Live Demonstration in Web Application & Swagger UI
> *(Switch browser to `http://localhost:5173` or `http://127.0.0.1:8000/app`)*
>
> *"Now let's explore our modern AI SaaS web application.*
>
> *On the **Dashboard**, we see the hero section 'Give Your Voice a New Dimension', animated waveforms, engine status indicators, and direct navigation cards for both services.*
>
> *Let's navigate to **Speech-to-Text**. Here we have an elegant drag-and-drop upload interface. I'll drop `recording.wav`, select Tamil `ta-IN`, and click **Transcribe Audio**.*
>
> *(Click Transcribe Audio and show the result card)*
>
> *We immediately receive the Tamil transcription, model info `prisma-v3.0`, and latency stats. We can easily copy or download the transcript.*
>
> *Next, let's navigate to **Text-to-Speech**. Here we have a rich text editor with character counting, presets, 13 native Indian voice personas, and speed controls. I'll select voice `Lakshmi` and click **Generate Speech**.*
>
> *(Click Generate Speech and play the custom audio waveform player)*
>
> *The server synthesizes speech via Timbre v3.0, and our player allows interactive waveform playback, seeking, and one-click 48 kHz WAV download.*
>
> *The application also provides an **API Status** page with real-time health pings, as well as interactive Swagger docs at `/docs`."*

---

### [2:45 – 3:30] Testing & Reliability
> *(Switch to terminal)*
>
> *"Reliability is a crucial requirement for this challenge. Let's run our automated test suite:*
>
> `python -m pytest -v`
>
> *(Run pytest and let the 35 tests scroll)*
>
> *All 35 tests pass cleanly in under 2 seconds. These tests cover input validation, duration limits, error propagation for status codes like 401, 402, 429, and 500, all using mocked calls so they run without consuming API credits.*
>
> *In addition, our live integration script `verify_e2e_live.py` verifies both live STT and live TTS against Gnani AI's cloud servers."*

---

### [3:30 – 4:00] Conclusion & Wrap-Up
> *"To summarize:*
> 1. *We successfully integrated Gnani AI's Prisma v3.0 STT API.*
> 2. *We successfully integrated Gnani AI's Timbre v3.0 TTS API.*
> 3. *We built a clean, modular FastAPI backend with comprehensive error handling.*
> 4. *We achieved 100% test pass rate with automated unit tests and validated live responses.*
>
> *The project is fully documented, tested, and ready for deployment. Thank you for your time!"*

# Smart Sync: AI-Powered Crisis Coordination Command Center 🚨

Welcome to the **Smart Sync** MVP! This project was built to revolutionize how volunteer coordination and disaster relief are managed during a crisis.

**🟢 Live Demo (Google Cloud Run):** [https://smart-sync-478138632958.us-central1.run.app](https://smart-sync-478138632958.us-central1.run.app)
## 🌟 The Problem
During disasters, emergency management teams are overwhelmed with unorganized field reports, blurry images, and chaotic audio dispatches. Matching the right volunteers with the right skills to specific emergencies is entirely manual, costing critical response time.

## 🚀 Our Solution
Smart Sync is a live **Command Center Dashboard** that uses Deep AI integration to instantly parse chaotic field inputs (images and voice) into structured data, dynamically visualize them on a live map, and use AI reasoning to instantly dispatch the perfect volunteer based on skills, location, and availability.

### 🔥 Key Features (WOW Factors)
1. **Multi-Modal AI Ingestion (Vision + Audio):** 
   - **Image OCR**: Upload a field report image, and Gemini 2.5 Flash extracts the location, urgency, and need into a structured JSON payload instantly.
   - **Voice Dispatch**: Click the dashboard microphone, speak naturally (*"Dispatch a doctor to the Central Station"*), and the AI automatically extracts the need, finds the best volunteer, and physically speaks a confirmation back to you.
2. **Dynamic Live Map Pins:** Urgent needs are rendered live on a Google Map using custom pulsing HTML Overlays. Click a pin to instantly view details and trigger AI matching.
3. **Intelligent Volunteer Matching:** Our AI doesn't just keyword match. It weighs **Skills vs. Distance vs. Availability**. It knows that an emergency requiring a "Doctor" shouldn't just be assigned to the closest person with "First Aid" training.

## 🏗️ Architecture & Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS
- **AI Engine**: Google Gemini 2.5 Flash (`@google/genai`)
- **Database**: Supabase (PostgreSQL)
- **Mapping**: `@react-google-maps/api` with custom OverlayViews
- **Testing**: Jest (100% Test Pass Rate for Core API routes & UI)

## 🛠️ How to Run Locally
1. Clone the repository
2. Run `npm install`
3. Ensure `.env.local` is configured with `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `GEMINI_API_KEY`.
4. Run `npm run dev` and navigate to `http://localhost:3000`

## 📊 Testing
Run `npm run test` to execute the complete Jest test suite verifying the multi-modal API logic and component rendering.

---
*Built for the Hackathon MVP Submission.*

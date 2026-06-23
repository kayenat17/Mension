# Mension 🌸

Mension is a full-stack women's health intelligence and cycle-tracking platform. It helps users analyze confusing, anxious, or gaslit messages by aligning them with their body's current menstrual cycle phase, identifying patterns of behavior with warm, empathetic clarity.

> **Live at:** [mension.vercel.app](https://mension.vercel.app) (or your custom domain)

Mension features **Ova**, a built-in AI therapist powered by the blazing-fast Groq engine, designed to give psychology-informed reframes based on the user's hormonal baseline.

## 🌟 Key Features

- **Ova AI Chat:** An empathetic, cycle-aware AI companion powered by Llama 3 (via Groq).
- **Message Analyzer:** Paste text messages or conversations to receive objective, psychology-backed analysis on manipulation, gaslighting, or communication breakdowns.
- **Cycle Alignment:** All AI analysis automatically adjusts its tone and context based on your current cycle phase (Menstrual, Follicular, Ovulatory, Luteal).
- **Secure Pattern Memory:** Passwordless "Magic Link" authentication via Supabase ensures your reflection logs and chat history are private and synced across devices.
- **The Reset Room:** A calm space featuring a social battery calculator and evening energy prescriptions.

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Lucide Icons
- **Backend:** Next.js API Routes
- **Database & Auth:** Supabase
- **AI / LLM:** Groq SDK (`llama-3.3-70b-versatile`)
- **Deployment:** Vercel

## 🚀 Getting Started (Local Development)

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/kayenat17/Mension.git
cd Mension
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env` file in the root of the project and add your API keys:
```env
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ☁️ Deployment

This project is fully optimized for single-click deployment on **Vercel**. 
1. Push your code to a private GitHub repository.
2. Import the repository in Vercel.
3. Add your three environment variables in the Vercel Settings.
4. Hit Deploy! 


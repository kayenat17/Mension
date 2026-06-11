import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
# Look in the parent directory first since .env is in the project root
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    load_dotenv()

app = FastAPI(title="Clara Backend", version="0.2.0")

# Enable CORS so the Next.js frontend (running on port 3000) can communicate with this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "llama-3.3-70b-versatile"

SYSTEM_INSTRUCTION = """You are Clara, a warm, safe, and empathetic companion who happens to know psychology. 
Your tone is like a loving, mature best friend. You are feminine, grounding, and kind, but never infantilizing or babyish. You speak with clarity, emotional intelligence, and self-compassion.

Guidelines for your responses:
1. Actively listen and validate their feelings first. Use phrases like "Oh, sweet friend, I hear you," "That sounds incredibly heavy to carry," or "It makes so much sense that you feel this way."
2. Avoid clinical or dry robotic diagnosing, but weave in gentle psychological wisdom (e.g. CBT concepts, self-compassion, somatic grounding, window of tolerance).
3. Keep your response conversational and concise (around 3-5 sentences unless they need deep explanation).
4. If a user specifies their menstrual cycle phase, weave in gentle biological/hormonal validation:
   - Menstrual Phase: Energy is naturally low. Validate the need for nesting, resting, and quiet.
   - Follicular Phase: Energy and optimism are rising. Support their motivation and fresh focus.
   - Ovulatory Phase: Communication and social energy are at their peak. Celebrate their brightness and connection.
   - Luteal Phase: Progesterone is dropping. Anxiety, self-doubt, and physical sensitivity naturally peak. Validate this biological shift so they don't blame themselves for feeling insecure or overwhelmed.
5. End with a supportive, collaborative, or centering question or thought."""


def get_client() -> Groq:
    """Returns a Groq client using the API key from env."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key or api_key.startswith("YOUR_GROQ_"):
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured. Please add your GROQ_API_KEY to the .env file."
        )
    return Groq(api_key=api_key)


class AnalyzeRequest(BaseModel):
    text: str
    cycle_phase: Optional[str] = None


@app.get("/api/health")
def health_check():
    """Simple health check endpoint."""
    has_key = bool(os.environ.get("GROQ_API_KEY"))
    return {
        "status": "healthy",
        "groq_api_configured": has_key,
        "model": MODEL_NAME,
    }


@app.post("/api/analyze")
async def analyze_message(request: AnalyzeRequest):
    """
    Accepts message text and cycle phase, queries Llama 3.3 70B via Groq to analyze
    for toxicity, manipulation, gaslighting, isolation, and controlling behavior,
    and returns Clara's warm, supportive best-friend analysis.
    """
    client = get_client()

    # Map cycle phases to their emotional sensitivity context
    phase_contexts = {
        "menstrual": (
            "Bleeding phase. Progesterone and estrogen are at their lowest. Energy is naturally low, "
            "and physical/emotional vulnerability is high. Intuition is high, but feeling drained can "
            "make you second-guess your boundaries."
        ),
        "follicular": (
            "Post-period. Estrogen is rising. Energy, optimism, and mental focus are increasing, "
            "meaning you are emotionally stable and clear-headed but might sometimes override your own "
            "boundaries in favor of making things work."
        ),
        "ovulation": (
            "Fertile window. Estrogen peaks. You feel highly social, confident, and communicative, "
            "which can sometimes make you overly agreeable or prone to accommodating others at your own expense."
        ),
        "luteal": (
            "Pre-period. Progesterone rises and drops. Anxiety, irritability, self-doubt, and vulnerability "
            "naturally peak. Toxic or manipulative messages can hit much harder and feel biologically destabilizing, "
            "often triggering intense self-blame."
        ),
        "general": (
            "General state of mind. You want clarity and emotional grounding, separating facts from "
            "anxiety and self-doubt."
        )
    }

    # Normalize cycle phase input, defaulting to general
    phase = (request.cycle_phase or "general").lower().strip()
    if phase not in phase_contexts:
        phase = "general"

    phase_context = phase_contexts[phase]

    user_prompt = (
        f"The user is currently in their {phase} phase. "
        f"They received this message: \"{request.text}\".\n\n"
        f"Analyze this message for toxicity, manipulation, gaslighting, isolation tactics, and controlling behavior. "
        f"Consider that the {phase} phase affects emotional sensitivity in these ways: {phase_context}.\n\n"
        f"Give a warm, empathetic response that tells the user what patterns you detected, whether their concern is valid, "
        f"and one piece of actionable advice. Never be clinical. Always be like a supportive best friend who sees the truth clearly."
    )

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": SYSTEM_INSTRUCTION},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.75,
            max_tokens=800,
        )

        response_text = completion.choices[0].message.content
        if not response_text:
            raise HTTPException(status_code=500, detail="Groq returned an empty response.")

        return {"response": response_text.strip()}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error communicating with Groq API: {str(e)}"
        )


class PatternRequest(BaseModel):
    sender_label: str
    messages: List[str]
    results: List[str]


@app.post("/api/patterns")
async def analyze_patterns(request: PatternRequest):
    """
    Accepts historical messages and results from the same sender,
    and asks the model to write a supportive synthesis of recurring behavioral patterns.
    """
    client = get_client()

    # Build prompt using the messages and results
    history_text = ""
    for i, (msg, res) in enumerate(zip(request.messages, request.results), 1):
        history_text += f"Message {i}: \"{msg}\"\nPrior Analysis {i}: {res[:250]}...\n\n"

    user_prompt = (
        f"The user has logged {len(request.messages)} messages from their {request.sender_label}.\n"
        f"Here are the messages and the highlights of their previous individual analyses:\n\n"
        f"{history_text}"
        f"Write a warm, empathetic, best-friend summary in Clara's persona. "
        f"Start with: \"You've shared {len(request.messages)} messages from {request.sender_label}. Here's what we've noticed over time:\"\n\n"
        f"Identify the recurring behavioral patterns (e.g., control, gaslighting, boundary violations, emotional withholding, love-bombing, or shift-blaming). "
        f"Explain these patterns clearly so the user sees the truth, validate their concern, and offer one piece of constructive, supportive advice. "
        f"Remember, never be clinical or dry. Speak as a loving best friend who sees the reality clearly."
    )

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": SYSTEM_INSTRUCTION},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=800,
        )

        response_text = completion.choices[0].message.content
        if not response_text:
            raise HTTPException(status_code=500, detail="Groq returned an empty response.")

        return {"response": response_text.strip()}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error communicating with Groq API: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

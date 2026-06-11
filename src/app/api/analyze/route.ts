import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const { text, cycle_phase } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.startsWith("your_groq")) {
      return NextResponse.json(
        { error: "Something went wrong — try again in a moment 💜" },
        { status: 500 }
      );
    }

    // Map cycle phases to their emotional sensitivity context
    const phaseContexts: Record<string, string> = {
      menstrual:
        "Bleeding phase. Progesterone and estrogen are at their lowest. Energy is naturally low, " +
        "and physical/emotional vulnerability is high. Intuition is high, but feeling drained can " +
        "make you second-guess your boundaries.",
      follicular:
        "Post-period. Estrogen is rising. Energy, optimism, and mental focus are increasing, " +
        "meaning you are emotionally stable and clear-headed but might sometimes override your own " +
        "boundaries in favor of making things work.",
      ovulation:
        "Fertile window. Estrogen peaks. You feel highly social, confident, and communicative, " +
        "which can sometimes make you overly agreeable or prone to accommodating others at your own expense.",
      luteal:
        "Pre-period. Progesterone rises and drops. Anxiety, irritability, self-doubt, and vulnerability " +
        "naturally peak. Toxic or manipulative messages can hit much harder and feel biologically destabilizing, " +
        "often triggering intense self-blame.",
      general:
        "General state of mind. You want clarity and emotional grounding, separating facts from " +
        "anxiety and self-doubt."
    };

    // Normalize cycle phase input, defaulting to general
    let phase = (cycle_phase || "general").toLowerCase().trim();
    if (!phaseContexts[phase]) {
      phase = "general";
    }

    const phaseContext = phaseContexts[phase];

    // Initialize Groq API client
    const client = new Groq({ apiKey });

    // Build prompt using the user's exact structure
    const systemPrompt = `You are Ova, a warm empathetic therapist. Be SHORT and conversational — 2 to 3 sentences MAX. Never use bullet points or long paragraphs.
You must output a valid JSON object with exactly two keys:
- "response": your conversational text analysis
- "isToxic": a boolean (true or false) indicating if you detected serious manipulation, gaslighting, or controlling behavior.

Rules for your text "response":
- Validate their feeling in one warm sentence.
- Add one sharp, insightful observation (psychology-informed but never clinical).
- End with one short, open question or gentle nudge.
- If relevant, briefly weave in their cycle phase context: ${phaseContext}.
- Never be wordy. Think texting a wise, loving friend, not writing an essay.`;

    const userPrompt =
      `The user is currently in their ${phase} phase. ` +
      `They received this message: "${text}".\n\n` +
      `First, evaluate if this message is genuinely toxic, or if it is healthy, neutral, or positive (like "I love you" or "How are you"). ` +
      `If it is a healthy/normal message, reassure the user that it is safe and do NOT invent manipulative tactics. Set "isToxic" to false. ` +
      `If it DOES show red flags, analyze it for toxicity, manipulation, gaslighting, or controlling behavior and set "isToxic" to true. ` +
      `Consider that the ${phase} phase affects emotional sensitivity in these ways: ${phaseContext}.\n\n` +
      `Give a warm, empathetic response telling the user what you noticed, validating their feelings, ` +
      `and offering one piece of actionable advice. Never be clinical. Always be like a supportive best friend who sees the truth clearly.`;

    // Call Groq API
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.75,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("Empty response from Groq API");
    }

    const parsedData = JSON.parse(responseContent);

    return NextResponse.json({ 
      response: (parsedData.response || "").trim(),
      isToxic: !!parsedData.isToxic
    });
  } catch (err: any) {
    console.error("Groq Analyze API error:", err);
    return NextResponse.json(
      { error: "Something went wrong — try again in a moment 💜" },
      { status: 500 }
    );
  }
}

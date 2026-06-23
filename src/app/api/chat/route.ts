import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { PHASE_CONTEXTS, normalizePhase } from "@/utils/phaseContexts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { message, history, cycle_phase } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.startsWith("your_groq")) {
      return NextResponse.json(
        { error: "Something went wrong — try again in a moment 💜" },
        { status: 500 }
      );
    }

    const phase = normalizePhase(cycle_phase);
    const phaseContext = PHASE_CONTEXTS[phase];

    const systemPrompt = `You are Ova, a warm empathetic therapist. Be SHORT and conversational — 2 to 3 sentences MAX. Never use bullet points or long paragraphs.

Rules:
- Validate their feeling in one warm sentence.
- Add one sharp, insightful observation (psychology-informed but never clinical).
- End with one short, open question or gentle nudge.
- If relevant, briefly weave in their cycle phase context: ${phaseContext}.
- Never be wordy. Think texting a wise, loving friend, not writing an essay.`;

    const client = new Groq({ apiKey });

    // Format chat history for Groq (role must be "user" or "assistant")
    const groqHistory = (history || []).map((h: any) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: h.text,
    }));

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...groqHistory,
        { role: "user", content: message },
      ],
      temperature: 0.75,
      max_tokens: 250,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("Empty response from Groq API");
    }

    return NextResponse.json({ response: responseText.trim() });
  } catch (err: any) {
    console.error("Groq Chat API error:", err);
    return NextResponse.json(
      { error: "Something went wrong — try again in a moment 💜" },
      { status: 500 }
    );
  }
}

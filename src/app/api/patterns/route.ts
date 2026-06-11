import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const { sender_label, messages, results } = await req.json();

    if (!sender_label || !messages || !results || !Array.isArray(messages) || !Array.isArray(results)) {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.startsWith("your_groq")) {
      return NextResponse.json(
        { error: "Something went wrong — try again in a moment 💜" },
        { status: 500 }
      );
    }

    // Initialize Groq API client
    const client = new Groq({ apiKey });

    // Compile message histories into a clean text block
    let historyText = "";
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const res = results[i] || "";
      historyText += `Message ${i + 1}: "${msg}"\nPrior Analysis ${i + 1}: ${res.substring(0, 250)}...\n\n`;
    }

    const systemPrompt = `You are Ova, a warm empathetic therapist. Be SHORT and conversational — 2 to 3 sentences MAX. Never use bullet points or long paragraphs.

Rules:
- Validate their feeling in one warm sentence.
- Add one sharp, insightful observation (psychology-informed but never clinical).
- End with one short, open question or gentle nudge.
- Never be wordy. Think texting a wise, loving friend, not writing an essay.`;

    // Build pattern analysis prompt
    const userPrompt =
      `The user has logged ${messages.length} messages from their ${sender_label}.\n` +
      `Here are the messages and the highlights of their previous individual analyses:\n\n` +
      `${historyText}` +
      `Write a warm, empathetic, empathetic summary in Mension's persona. ` +
      `Start with: "You've shared ${messages.length} messages from ${sender_label}. Here's what we've noticed over time:"\n\n` +
      `Identify the recurring behavioral patterns (e.g., control, gaslighting, boundary violations, emotional withholding, love-bombing, or shift-blaming). ` +
      `Explain these patterns clearly so the user sees the truth, validate their concern, and offer one piece of constructive, supportive advice. ` +
      `Remember, never be clinical or dry. Speak as a loving best friend who sees the reality clearly.`;

    // Call Groq API
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("Empty response from Groq API");
    }

    return NextResponse.json({ response: responseText.trim() });
  } catch (err: any) {
    console.error("Groq patterns API error:", err);
    return NextResponse.json(
      { error: "Something went wrong — try again in a moment 💜" },
      { status: 500 }
    );
  }
}

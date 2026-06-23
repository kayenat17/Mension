import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  const hasKey = apiKey !== undefined && apiKey !== "" && !apiKey.startsWith("your_groq");
  
  return NextResponse.json({
    status: "healthy",
    groq_api_configured: hasKey
  });
}

import { NextResponse } from "next/server";
import { openai } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful AI note summarizer. Create concise, clear summaries." },
        { role: "user", content: `Summarize this note:\n${content}` },
      ],
    });

    return NextResponse.json({ 
      summary: completion.choices[0].message?.content || "" 
    });
  } catch (error) {
    console.error("Summarize error:", error);
    return NextResponse.json(
      { error: "Failed to summarize note" },
      { status: 500 }
    );
  }
}

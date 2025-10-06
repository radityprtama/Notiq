import { NextResponse } from "next/server";
import { openai } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { content, instruction } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const prompt = instruction
      ? `Rewrite this note with the following instruction: ${instruction}\n\nNote:\n${content}`
      : `Improve and rewrite this note to make it clearer and more professional:\n${content}`;

    const completion = await openai.chat.completions.create({
      model: "z-ai/glm-4.5-air:free",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI writing assistant. Rewrite notes to improve clarity and professionalism.",
        },
        { role: "user", content: prompt },
      ],
    });

    return NextResponse.json({
      rewritten: completion.choices[0].message?.content || "",
    });
  } catch (error) {
    console.error("Rewrite error:", error);
    return NextResponse.json(
      { error: "Failed to rewrite note" },
      { status: 500 }
    );
  }
}

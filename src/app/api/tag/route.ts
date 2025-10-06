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
      model: "z-ai/glm-4.5-air:free",
      messages: [
        {
          role: "system",
          content:
            'You are a helpful AI that extracts relevant tags from notes. Return only a JSON array of tags (3-5 tags max), lowercase, single words or short phrases. Example: ["work", "meeting", "project-alpha"]',
        },
        { role: "user", content: `Extract tags from this note:\n${content}` },
      ],
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message?.content || "{}";
    let tags: string[] = [];

    try {
      const parsed = JSON.parse(response);
      tags = parsed.tags || [];
    } catch {
      // Fallback if JSON parsing fails
      tags = [];
    }

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Tag error:", error);
    return NextResponse.json(
      { error: "Failed to generate tags" },
      { status: 500 }
    );
  }
}

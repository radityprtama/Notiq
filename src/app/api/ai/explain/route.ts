import { NextResponse } from "next/server";
import { openai } from "@/lib/ai";
import type { AIExplainResult } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { code, language, context } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    const prompt = `Analyze and explain the following ${language || "code"} snippet${context ? ` (Context: ${context})` : ""}:

\`\`\`${language || ""}
${code}
\`\`\`

Provide:
1. A clear explanation of what the code does
2. Complexity assessment (simple/moderate/complex)
3. Key concepts used
4. Suggestions for improvement (if any)

Respond in JSON format:
{
  "explanation": "detailed explanation",
  "complexity": "simple|moderate|complex",
  "concepts": ["concept1", "concept2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

    const completion = await openai.chat.completions.create({
      model: "z-ai/glm-4.5-air:free",
      messages: [
        {
          role: "system",
          content:
            "You are an expert code reviewer and educator. Explain code clearly and provide actionable insights.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message?.content || "{}";
    const result: AIExplainResult = JSON.parse(response);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Explain error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to explain code" },
      { status: 500 }
    );
  }
}

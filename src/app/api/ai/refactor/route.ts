import { NextResponse } from "next/server";
import { openai } from "@/lib/ai";
import type { AIRefactorResult } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { code, language, instruction } = await req.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    const prompt = instruction
      ? `Refactor this ${language} code with the following instruction: "${instruction}"\n\n\`\`\`${language}\n${code}\n\`\`\``
      : `Refactor and optimize this ${language} code for better readability, performance, and maintainability:\n\n\`\`\`${language}\n${code}\n\`\`\``;

    const fullPrompt = `${prompt}

Provide:
1. The refactored code
2. List of improvements made
3. Reasoning for changes

Respond in JSON format:
{
  "refactored": "refactored code here",
  "improvements": ["improvement1", "improvement2"],
  "reasoning": "why these changes improve the code"
}`;

    const completion = await openai.chat.completions.create({
      model: "z-ai/glm-4.5-air:free",
      messages: [
        {
          role: "system",
          content:
            "You are an expert software engineer specializing in code refactoring. Focus on clean code principles, performance, and maintainability.",
        },
        { role: "user", content: fullPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message?.content || "{}";
    const result: AIRefactorResult = JSON.parse(response);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Refactor error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refactor code" },
      { status: 500 }
    );
  }
}

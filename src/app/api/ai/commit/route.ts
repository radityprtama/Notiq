import { NextResponse } from "next/server";
import { openai } from "@/lib/ai";
import type { AICommitResult } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { diff, style = "conventional" } = await req.json();

    if (!diff) {
      return NextResponse.json({ error: "Diff is required" }, { status: 400 });
    }

    const styleInstructions = {
      conventional:
        "Use Conventional Commits format: type(scope): description. Types: feat, fix, docs, style, refactor, test, chore",
      semantic:
        "Use semantic commit format with clear, descriptive messages",
      simple: "Keep it simple and straightforward",
    };

    const prompt = `Generate a commit message for the following git diff:

\`\`\`diff
${diff}
\`\`\`

Style: ${style}
${styleInstructions[style as keyof typeof styleInstructions]}

Provide:
1. A clear commit message
2. Commit type (feat, fix, docs, etc.)
3. Scope (if applicable)
4. Whether it's a breaking change

Respond in JSON format:
{
  "message": "the commit message",
  "type": "feat|fix|docs|style|refactor|test|chore",
  "scope": "optional scope",
  "breaking": false
}`;

    const completion = await openai.chat.completions.create({
      model: "z-ai/glm-4.5-air:free",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at writing clear, concise commit messages that follow best practices. Analyze code changes and generate meaningful commit messages.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message?.content || "{}";
    const result: AICommitResult = JSON.parse(response);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Commit error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate commit message" },
      { status: 500 }
    );
  }
}

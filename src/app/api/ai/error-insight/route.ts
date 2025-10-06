import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { AIErrorInsightResult } from "@/lib/types";
import { openai } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { errorText, context, userId } = await req.json();

    if (!errorText) {
      return NextResponse.json(
        { error: "Error text is required" },
        { status: 400 }
      );
    }

    const prompt = `Analyze this error log and provide detailed insights:

\`\`\`
${errorText}
\`\`\`

${context?.language ? `Language: ${context.language}\n` : ""}${context?.framework ? `Framework: ${context.framework}\n` : ""}

Provide:
1. Clear explanation of what the error means
2. Detected language/framework (if not provided)
3. Possible causes
4. Detailed solutions with steps
5. Related documentation links

Respond in JSON format:
{
  "explanation": "what this error means",
  "detectedLanguage": "javascript|python|etc",
  "detectedFramework": "react|express|django|etc",
  "possibleCauses": ["cause1", "cause2"],
  "solutions": [
    {
      "title": "Solution title",
      "steps": ["step1", "step2"],
      "code": "example fix code",
      "reference": "documentation URL"
    }
  ],
  "relatedDocs": ["url1", "url2"]
}`;

    const completion = await openai.chat.completions.create({
      model: "z-ai/glm-4.5-air:free",
      messages: [
        {
          role: "system",
          content:
            "You are an expert debugging assistant with deep knowledge of programming languages, frameworks, and common error patterns. Provide clear, actionable solutions.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message?.content || "{}";
    const result: AIErrorInsightResult = JSON.parse(response);

    // Optionally save to database if userId provided
    if (user && user.id === userId) {
      await supabase.from("error_logs").insert({
        user_id: userId,
        error_text: errorText,
        language: result.detectedLanguage,
        framework: result.detectedFramework || null,
        ai_explanation: result.explanation,
        ai_solution: result.solutions,
        is_resolved: false,
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Error Insight error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze error" },
      { status: 500 }
    );
  }
}

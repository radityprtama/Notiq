import { NextResponse } from "next/server";
import { openai } from "@/lib/ai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { noteId, content } = await req.json();

    if (!noteId || !content) {
      return NextResponse.json(
        { error: "Note ID and content are required" },
        { status: 400 }
      );
    }

    // Generate embedding
    const embeddingResponse = await openai.embeddings.create({
      model: "z-ai/glm-4.5-air:free",
      input: content,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Store embedding in ai_metadata table
    const { error } = await supabase.from("ai_metadata").upsert({
      note_id: noteId,
      embedding: embedding,
    });

    if (error) {
      console.error("Embedding storage error:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Embed error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate embedding" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("snippets")
      .select("*")
      .eq("user_id", user.id)
      .order("usage_count", { ascending: false })
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ snippets: data });
  } catch (error: any) {
    console.error("Snippets GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch snippets" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, code, language, description, tags, note_id } =
      await req.json();

    if (!title || !code || !language) {
      return NextResponse.json(
        { error: "Title, code, and language are required" },
        { status: 400 }
      );
    }

    // Generate tags with AI if not provided
    let finalTags = tags;
    if (!tags || tags.length === 0) {
      try {
        const aiResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/api/tag`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: `${title}\n\n${code}` }),
          }
        );
        const aiData = await aiResponse.json();
        finalTags = aiData.tags || [];
      } catch (error) {
        console.error("AI tag generation failed:", error);
        finalTags = [];
      }
    }

    const { data, error } = await supabase
      .from("snippets")
      .insert({
        user_id: user.id,
        title,
        code,
        language,
        description: description || null,
        tags: finalTags,
        note_id: note_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ snippet: data }, { status: 201 });
  } catch (error: any) {
    console.error("Snippets POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create snippet" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snippetId = params.id;

    // Increment usage count
    const { error } = await supabase.rpc("increment_snippet_usage", {
      snippet_id: snippetId,
    });

    // If RPC doesn't exist, fallback to manual update
    if (error) {
      const { data: snippet } = await supabase
        .from("snippets")
        .select("usage_count")
        .eq("id", snippetId)
        .single();

      if (snippet) {
        await supabase
          .from("snippets")
          .update({ usage_count: (snippet.usage_count || 0) + 1 })
          .eq("id", snippetId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Usage increment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to increment usage" },
      { status: 500 }
    );
  }
}

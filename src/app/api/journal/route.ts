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
      .from("dev_journal")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(30);

    if (error) throw error;

    return NextResponse.json({ entries: data });
  } catch (error: any) {
    console.error("Journal GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch journal entries" },
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

    const {
      date,
      content,
      mood,
      tech_used,
      achievements,
      blockers,
    } = await req.json();

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    // Upsert (update if exists, insert if not)
    const { data, error } = await supabase
      .from("dev_journal")
      .upsert(
        {
          user_id: user.id,
          date,
          content: content || null,
          mood: mood || null,
          tech_used: tech_used || [],
          achievements: achievements || [],
          blockers: blockers || [],
        },
        { onConflict: "user_id,date" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (error: any) {
    console.error("Journal POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save journal entry" },
      { status: 500 }
    );
  }
}

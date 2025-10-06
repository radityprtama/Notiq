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
    const { query, userId, filters } = await req.json();

    if (!query || !userId) {
      return NextResponse.json(
        { error: "Query and userId are required" },
        { status: 400 }
      );
    }

    // Generate embedding for the search query
    const embeddingResponse = await openai.embeddings.create({
      model: "z-ai/glm-4.5-air:free",
      input: query,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Build the RPC query
    let rpcQuery: any = {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 10,
      user_id_param: userId,
    };

    // Perform semantic search using Supabase function
    const { data: searchResults, error } = await supabase.rpc(
      "search_notes_semantic",
      rpcQuery
    );

    if (error) {
      console.error("Semantic search error:", error);
      throw error;
    }

    // Apply additional filters
    let filteredResults = searchResults || [];

    if (filters?.tags && filters.tags.length > 0) {
      filteredResults = filteredResults.filter((note: any) => {
        return (
          note.tags &&
          filters.tags.some((tag: string) => note.tags.includes(tag))
        );
      });
    }

    if (filters?.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      filteredResults = filteredResults.filter((note: any) => {
        return new Date(note.created_at) >= dateFrom;
      });
    }

    if (filters?.dateTo) {
      const dateTo = new Date(filters.dateTo);
      filteredResults = filteredResults.filter((note: any) => {
        return new Date(note.created_at) <= dateTo;
      });
    }

    return NextResponse.json({
      results: filteredResults,
      count: filteredResults.length,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform search" },
      { status: 500 }
    );
  }
}

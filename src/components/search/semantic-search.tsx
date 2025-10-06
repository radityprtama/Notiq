"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Filter, Calendar, Hash, Sparkles, Loader2 } from "lucide-react";
import { Note } from "@/lib/types";

interface SemanticSearchProps {
  userId: string;
  onSelectNote: (noteId: string) => void;
  availableTags: string[];
}

export function SemanticSearch({ userId, onSelectNote, availableTags }: SemanticSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tags: [] as string[],
    dateFrom: "",
    dateTo: "",
  });

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          userId,
          filters: filters.tags.length > 0 || filters.dateFrom || filters.dateTo
            ? filters
            : undefined,
        }),
      });

      const data = await response.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const clearFilters = () => {
    setFilters({ tags: [], dateFrom: "", dateTo: "" });
  };

  const hasActiveFilters = filters.tags.length > 0 || filters.dateFrom || filters.dateTo;

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b border-border/40 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by meaning or context..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 pr-10"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? "border-primary" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 p-3 bg-accent/30 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" />
                Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div>
                <label className="text-xs font-medium flex items-center gap-1.5 mb-2">
                  <Hash className="h-3 w-3" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${
                        filters.tags.includes(tag)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Filter */}
            <div>
              <label className="text-xs font-medium flex items-center gap-1.5 mb-2">
                <Calendar className="h-3 w-3" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                  }
                  className="text-xs"
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                  }
                  className="text-xs"
                  placeholder="To"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {results.length === 0 && query && !loading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No results found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try a different search query or adjust filters
              </p>
            </div>
          )}

          {results.length === 0 && !query && (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Search by meaning, not just keywords
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try "meeting notes from last week" or "project ideas"
              </p>
            </div>
          )}

          {results.map((result) => (
            <button
              key={result.note_id}
              onClick={() => onSelectNote(result.note_id)}
              className="w-full text-left p-3 rounded-lg hover:bg-accent/50 transition-colors border border-border/40"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-medium text-sm">{result.title}</h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {Math.round(result.similarity * 100)}% match
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {result.content}
              </p>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

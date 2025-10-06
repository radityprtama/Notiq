"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Copy, Check, Trash2, Edit2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Snippet } from "@/lib/types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface SnippetsViewProps {
  userId: string;
}

export function SnippetsView({ userId }: SnippetsViewProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchSnippets();
    }
  }, [userId]);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/snippets`);
      const data = await response.json();
      setSnippets(data.snippets || []);
    } catch (error) {
      console.error("Error fetching snippets:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);

    // Increment usage count
    await fetch(`/api/snippets/${id}/usage`, { method: "POST" }).catch(
      console.error
    );
  };

  const filteredSnippets = snippets.filter(
    (snippet) =>
      snippet.title.toLowerCase().includes(search.toLowerCase()) ||
      snippet.language.toLowerCase().includes(search.toLowerCase()) ||
      snippet.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Loading snippets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Code2 className="h-6 w-6" />
              Code Snippets
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {snippets.length} snippet{snippets.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Snippet
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search snippets by title, language, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Snippet List */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {filteredSnippets.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4">
                <Code2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No snippets yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start building your code snippet library
              </p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Snippet
              </Button>
            </div>
          ) : (
            filteredSnippets.map((snippet) => (
              <div
                key={snippet.id}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">
                      {snippet.title}
                    </h3>
                    {snippet.description && (
                      <p className="text-sm text-muted-foreground">
                        {snippet.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        copyToClipboard(snippet.code, snippet.id);
                      }}
                    >
                      {copied === snippet.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="relative rounded-md overflow-hidden">
                  <div className="absolute top-2 right-2 z-10">
                    <span className="text-xs px-2 py-1 rounded bg-background/90 backdrop-blur-sm text-foreground font-mono border border-border">
                      {snippet.language}
                    </span>
                  </div>
                  <SyntaxHighlighter
                    language={snippet.language}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                    }}
                    showLineNumbers
                  >
                    {snippet.code}
                  </SyntaxHighlighter>
                </div>

                {snippet.tags && snippet.tags.length > 0 && (
                  <div className="mt-3 flex gap-1.5 flex-wrap">
                    {snippet.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-accent text-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Used {snippet.usage_count} times</span>
                  <span>
                    {new Date(snippet.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

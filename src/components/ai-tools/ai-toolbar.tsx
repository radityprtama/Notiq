"use client";

import { useState } from "react";
import { Sparkles, Wand2, Hash, Loader2, X, Check, Copy } from "lucide-react";
import { Note } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AIToolbarProps {
  note: Note | null;
  onUpdate: (updates: Partial<Note>) => void;
}

export function AIToolbar({ note, onUpdate }: AIToolbarProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!note) return null;

  const handleSummarize = async () => {
    if (!note.content) return;

    setLoading("summarize");
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note.content }),
      });

      const data = await response.json();
      if (data.summary) {
        setResult(data.summary);
        setDialogOpen(true);
        onUpdate({ summary: data.summary });
      }
    } catch (error) {
      console.error("Summarize error:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleRewrite = async () => {
    if (!note.content) return;

    setLoading("rewrite");
    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note.content }),
      });

      const data = await response.json();
      if (data.rewritten) {
        setResult(data.rewritten);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Rewrite error:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateTags = async () => {
    if (!note.content) return;

    setLoading("tag");
    try {
      const response = await fetch("/api/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note.content }),
      });

      const data = await response.json();
      if (data.tags) {
        onUpdate({ tags: data.tags });
      }
    } catch (error) {
      console.error("Tag error:", error);
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-16 py-2 border-b border-border/40 bg-background/50">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSummarize}
            disabled={loading !== null || !note.content}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
            title="Summarize with AI"
          >
            {loading === "summarize" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>Summarize</span>
          </button>
          <button
            onClick={handleRewrite}
            disabled={loading !== null || !note.content}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
            title="Rewrite with AI"
          >
            {loading === "rewrite" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5" />
            )}
            <span>Rewrite</span>
          </button>
          <button
            onClick={handleGenerateTags}
            disabled={loading !== null || !note.content}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
            title="Generate tags"
          >
            {loading === "tag" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Hash className="h-3.5 w-3.5" />
            )}
            <span>Tags</span>
          </button>
        </div>
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1.5">
            {note.tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary/90 font-medium"
              >
                <Hash className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold">
                  AI Generated Result
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Review the AI-generated content below
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all hover:bg-accent text-muted-foreground hover:text-foreground"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto mt-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {result}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

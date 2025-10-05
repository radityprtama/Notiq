"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Pencil, Tag, Loader2 } from "lucide-react";
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

  return (
    <>
      <div className="border-b p-2 flex items-center gap-2 bg-muted/20">
        <span className="text-sm text-muted-foreground mr-2">AI Tools:</span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSummarize}
          disabled={loading !== null || !note.content}
        >
          {loading === "summarize" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-1" />
          )}
          Summarize
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRewrite}
          disabled={loading !== null || !note.content}
        >
          {loading === "rewrite" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Pencil className="h-4 w-4 mr-1" />
          )}
          Rewrite
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleGenerateTags}
          disabled={loading !== null || !note.content}
        >
          {loading === "tag" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Tag className="h-4 w-4 mr-1" />
          )}
          Generate Tags
        </Button>
        {note.tags && note.tags.length > 0 && (
          <div className="flex gap-1 ml-auto">
            {note.tags.map((tag, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Result</DialogTitle>
            <DialogDescription>
              Here&apos;s what the AI generated for your note.
            </DialogDescription>
          </DialogHeader>
          <div className="prose dark:prose-invert max-w-none">
            {result}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { Note } from "@/lib/types";

interface NoteEditorProps {
  note: Note | null;
  onUpdate: (title: string, content: string) => void;
}

export function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (note) {
        onUpdate(title, content);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [title, content, note, onUpdate]);

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a note or create a new one
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="text-2xl font-bold border-none focus-visible:ring-0 px-0"
        />
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setShowPreview(false)}
            className={`text-sm px-3 py-1 rounded ${
              !showPreview ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`text-sm px-3 py-1 rounded ${
              showPreview ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {showPreview ? (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="min-h-full border-none resize-none focus-visible:ring-0 text-base"
          />
        )}
      </div>
    </div>
  );
}

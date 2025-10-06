"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Note } from "@/lib/types";
import { Eye, Edit3, Calendar, Save, Wifi, WifiOff } from "lucide-react";
import "highlight.js/styles/github-dark.css";

interface NoteEditorProps {
  note: Note | null;
  onUpdate: (title: string, content: string) => void;
}

export function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (note && (title !== note.title || content !== note.content)) {
        setIsSaving(true);
        try {
          await onUpdate(title, content);
          setLastSaved(new Date());
        } catch (error) {
          console.error("Failed to save:", error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(debounce);
  }, [title, content, note, onUpdate]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const adjustHeight = (element: HTMLTextAreaElement | null) => {
    if (element) {
      element.style.height = "auto";
      element.style.height = element.scrollHeight + "px";
    }
  };

  useEffect(() => {
    adjustHeight(titleRef.current);
  }, [title]);

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <div className="text-7xl mb-4 opacity-20">📝</div>
        <p className="text-lg">
          Select a note or create a new one to get started
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-16 py-3 border-b border-border/40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Edited {formatDate(note.updated_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {isSaving ? (
              <>
                <Save className="h-3.5 w-3.5 animate-pulse text-blue-500" />
                <span className="text-blue-500">Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Save className="h-3.5 w-3.5 text-green-500" />
                <span className="text-muted-foreground">
                  Saved {formatDate(lastSaved.toISOString())}
                </span>
              </>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {isOnline ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-green-500" />
                <span className="text-muted-foreground">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-orange-500">Offline</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowPreview(false)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-all ${
              !showPreview
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-all ${
              showPreview
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-16 py-12">
          {showPreview ? (
            <>
              <h1 className="text-[2.75rem] font-bold leading-tight mb-6 text-foreground">
                {title || "Untitled"}
              </h1>
              <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-base prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-img:rounded-lg prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-table:border-collapse prose-th:border prose-th:border-border prose-th:p-2 prose-td:border prose-td:border-border prose-td:p-2">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                >
                  {content || "No content yet..."}
                </ReactMarkdown>
              </div>
            </>
          ) : (
            <>
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  adjustHeight(titleRef.current);
                }}
                placeholder="Untitled"
                className="w-full text-[2.75rem] font-bold leading-tight mb-6 bg-transparent border-none outline-none resize-none overflow-hidden text-foreground placeholder:text-muted-foreground/40"
                rows={1}
                style={{ height: "auto" }}
              />
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing... Type '/' for commands"
                className="w-full min-h-[500px] text-base leading-relaxed bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/40"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

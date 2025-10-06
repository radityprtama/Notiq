"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  FileText,
  LogOut,
  Hash,
  Clock,
  ChevronDown,
  Sparkles,
  Code2,
  AlertCircle,
  BookOpen,
  Terminal,
} from "lucide-react";
import { Note } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onOpenSemanticSearch?: () => void;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export function Sidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onOpenSemanticSearch,
  currentView = "notes",
  onViewChange,
}: SidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="w-72 border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪶</span>
            <h1 className="font-semibold text-base">Notiq</h1>
          </div>
          <button className="p-1.5 rounded-md hover:bg-accent transition-colors">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <button
          onClick={onCreateNote}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-accent/80 bg-accent text-accent-foreground"
        >
          <Plus className="h-4 w-4" />
          New Note
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 pb-2 space-y-2">
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-accent/30">
          <button
            onClick={() => onViewChange?.("notes")}
            className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentView === "notes"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Notes
          </button>
          <button
            onClick={() => onViewChange?.("snippets")}
            className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentView === "snippets"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            Snippets
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => onViewChange?.("errors")}
            className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentView === "errors"
                ? "bg-accent shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Errors
          </button>
          <button
            onClick={() => onViewChange?.("journal")}
            className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentView === "journal"
                ? "bg-accent shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Journal
          </button>
        </div>
      </div>

      {/* Search - only show for notes view */}
      {currentView === "notes" && (
        <div className="px-4 pb-2 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm bg-accent/50 border-none focus-visible:ring-1 focus-visible:ring-border"
            />
          </div>
          {onOpenSemanticSearch && (
            <button
              onClick={onOpenSemanticSearch}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all hover:bg-accent/80 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              Semantic Search
            </button>
          )}
        </div>
      )}

      {/* Content Area */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 py-2">
          {currentView === "notes" && (
            <>
              {filteredNotes.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-12 px-4">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No notes found</p>
                </div>
              ) : (
                filteredNotes.map((note) => {
                  const isSelected = selectedNoteId === note.id;
                  return (
                    <button
                      key={note.id}
                      onClick={() => onSelectNote(note.id)}
                      className={`group w-full text-left px-2 py-2 rounded-md transition-all ${
                        isSelected ? "bg-accent/70" : "hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <FileText
                          className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            isSelected
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm font-medium truncate mb-0.5 ${
                              isSelected
                                ? "text-foreground"
                                : "text-foreground/90"
                            }`}
                          >
                            {note.title || "Untitled"}
                          </div>
                          <div className="text-xs text-muted-foreground/70 truncate leading-relaxed">
                            {note.content.slice(0, 60) || "No content"}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(note.updated_at)}</span>
                            </div>
                            {note.tags && note.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Hash className="h-3 w-3 text-muted-foreground/60" />
                                <span className="text-[11px] text-muted-foreground/60">
                                  {note.tags.length}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </>
          )}

          {currentView !== "notes" && (
            <div className="text-center text-muted-foreground text-xs py-8 px-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent mb-2">
                {currentView === "snippets" && <Code2 className="h-5 w-5" />}
                {currentView === "errors" && (
                  <AlertCircle className="h-5 w-5" />
                )}
                {currentView === "journal" && <BookOpen className="h-5 w-5" />}
              </div>
              <p className="font-medium mb-1">
                {currentView === "snippets" && "Code Snippets"}
                {currentView === "errors" && "Error Logs"}
                {currentView === "journal" && "Dev Journal"}
              </p>
              <p className="text-[11px] leading-relaxed">
                {currentView === "snippets" &&
                  "Store and organize reusable code snippets"}
                {currentView === "errors" &&
                  "Track errors with AI-powered solutions"}
                {currentView === "journal" &&
                  "Document your development journey"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-border/40">
        {user && (
          <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-md hover:bg-accent/50 transition-colors">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">
                {user.email?.split("@")[0]}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {user.email}
              </div>
            </div>
          </div>
        )}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50"
          size="sm"
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}

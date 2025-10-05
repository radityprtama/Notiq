"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Plus, Search, FileText, LogOut } from "lucide-react";
import { Note } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
}

export function Sidebar({ notes, selectedNoteId, onSelectNote, onCreateNote }: SidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="w-64 border-r bg-muted/10 flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🪶</span>
          <h1 className="font-bold text-xl">Notiq</h1>
        </div>
        <Button onClick={onCreateNote} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No notes found
            </div>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                  selectedNoteId === note.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{note.title || "Untitled"}</div>
                    <div className="text-xs opacity-70 truncate">
                      {note.content.slice(0, 50) || "No content"}
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {note.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-1 py-0.5 rounded bg-background/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        {user && (
          <div className="mb-2 text-sm text-muted-foreground truncate">
            {user.email}
          </div>
        )}
        <Button onClick={handleLogout} variant="outline" className="w-full" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}

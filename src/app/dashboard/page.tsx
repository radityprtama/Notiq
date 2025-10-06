"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Note } from "@/lib/types";
import { Sidebar } from "@/components/sidebar/sidebar";
import { NoteEditor } from "@/components/editor/note-editor";
import { AIToolbar } from "@/components/ai-tools/ai-toolbar";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { SemanticSearch } from "@/components/search/semantic-search";
import { SnippetsView } from "@/components/views/snippets-view";
import { ErrorsView } from "@/components/views/errors-view";
import { JournalView } from "@/components/views/journal-view";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DashboardPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<string>("notes");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUser(user);
    fetchNotes(user.id);
  };

  const fetchNotes = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setNotes(data || []);
      if (data && data.length > 0) {
        setSelectedNote(data[0]);
      }

      // Extract all unique tags
      const tags = new Set<string>();
      data?.forEach((note) => {
        note.tags?.forEach((tag: string) => tags.add(tag));
      });
      setAllTags(Array.from(tags));
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!user) return;

    try {
      const newNote = {
        user_id: user.id,
        title: "Untitled Note",
        content: "",
        tags: [],
      };

      const { data, error } = await supabase
        .from("notes")
        .insert([newNote] as any)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setNotes([data, ...notes]);
        setSelectedNote(data);
      }
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleSelectNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setSelectedNote(note);
    }
  };

  const handleUpdateNote = async (title: string, content: string) => {
    if (!selectedNote) return;

    try {
      const { error } = await supabase
        .from("notes")
        .update({ title, content, updated_at: new Date().toISOString() } as any)
        .eq("id", selectedNote.id);

      if (error) throw error;

      // Generate embedding for semantic search (async, don't wait)
      if (content && content.length > 10) {
        fetch("/api/embed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            noteId: selectedNote.id,
            content: `${title}\n\n${content}`,
          }),
        }).catch((err) => console.error("Embedding error:", err));
      }

      setNotes(
        notes.map((note) =>
          note.id === selectedNote.id
            ? { ...note, title, content, updated_at: new Date().toISOString() }
            : note
        )
      );

      setSelectedNote({ ...selectedNote, title, content });
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleAIUpdate = async (updates: Partial<Note>) => {
    if (!selectedNote) return;

    try {
      const { error } = await supabase
        .from("notes")
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq("id", selectedNote.id);

      if (error) throw error;

      const updatedNote = { ...selectedNote, ...updates };
      setNotes(
        notes.map((note) => (note.id === selectedNote.id ? updatedNote : note))
      );
      setSelectedNote(updatedNote);
    } catch (error) {
      console.error("Error updating note with AI:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        notes={notes}
        selectedNoteId={selectedNote?.id || null}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onOpenSemanticSearch={() => setSearchOpen(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === "notes" && (
          <>
            <AIToolbar note={selectedNote} onUpdate={handleAIUpdate} />
            <NoteEditor note={selectedNote} onUpdate={handleUpdateNote} />
          </>
        )}
        {currentView === "snippets" && user && (
          <SnippetsView userId={user.id} />
        )}
        {currentView === "errors" && user && <ErrorsView userId={user.id} />}
        {currentView === "journal" && user && <JournalView userId={user.id} />}
      </main>
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        notes={notes}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
      />

      {/* Semantic Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg font-semibold">🔍 Semantic Search</span>
            </DialogTitle>
          </DialogHeader>
          <div className="h-[60vh]">
            {user && (
              <SemanticSearch
                userId={user.id}
                onSelectNote={(noteId) => {
                  handleSelectNote(noteId);
                  setSearchOpen(false);
                }}
                availableTags={allTags}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

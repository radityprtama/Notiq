"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Note } from "@/lib/types";
import { Sidebar } from "@/components/sidebar/sidebar";
import { NoteEditor } from "@/components/editor/note-editor";
import { AIToolbar } from "@/components/ai-tools/ai-toolbar";
import { CommandPalette } from "@/components/command-palette/command-palette";

export default function DashboardPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
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
        notes.map((note) =>
          note.id === selectedNote.id ? updatedNote : note
        )
      );
      setSelectedNote(updatedNote);
    } catch (error) {
      console.error("Error updating note with AI:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        notes={notes}
        selectedNoteId={selectedNote?.id || null}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
      />
      <div className="flex-1 flex flex-col">
        <AIToolbar note={selectedNote} onUpdate={handleAIUpdate} />
        <NoteEditor note={selectedNote} onUpdate={handleUpdateNote} />
      </div>
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        notes={notes}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
      />
    </div>
  );
}

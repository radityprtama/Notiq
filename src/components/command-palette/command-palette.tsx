"use client";

import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText, Plus, Sparkles, Tag, Pencil } from "lucide-react";
import { Note } from "@/lib/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onAIAction?: (action: string) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  notes,
  onSelectNote,
  onCreateNote,
  onAIAction,
}: CommandPaletteProps) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={onCreateNote}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create new note</span>
          </CommandItem>
          {onAIAction && (
            <>
              <CommandItem onSelect={() => onAIAction("summarize")}>
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Summarize note</span>
              </CommandItem>
              <CommandItem onSelect={() => onAIAction("rewrite")}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Rewrite note</span>
              </CommandItem>
              <CommandItem onSelect={() => onAIAction("tag")}>
                <Tag className="mr-2 h-4 w-4" />
                <span>Generate tags</span>
              </CommandItem>
            </>
          )}
        </CommandGroup>
        <CommandGroup heading="Notes">
          {notes.map((note) => (
            <CommandItem
              key={note.id}
              onSelect={() => {
                onSelectNote(note.id);
                onOpenChange(false);
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>{note.title || "Untitled"}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

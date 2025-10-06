"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Smile,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DevJournal } from "@/lib/types";

interface JournalViewProps {
  userId: string;
}

const moods = [
  {
    value: "productive",
    label: "Productive",
    icon: "💪",
    color: "text-green-500",
  },
  { value: "learning", label: "Learning", icon: "📚", color: "text-blue-500" },
  {
    value: "challenging",
    label: "Challenging",
    icon: "🤔",
    color: "text-orange-500",
  },
  {
    value: "frustrated",
    label: "Frustrated",
    icon: "😤",
    color: "text-red-500",
  },
  { value: "excited", label: "Excited", icon: "🚀", color: "text-purple-500" },
];

export function JournalView({ userId }: JournalViewProps) {
  const [entries, setEntries] = useState<DevJournal[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<DevJournal>>({
    date: new Date().toISOString().split("T")[0],
    content: "",
    mood: "productive",
    tech_used: [],
    achievements: [],
    blockers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchEntries();
    }
  }, [userId]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/journal`);
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentEntry),
      });

      if (response.ok) {
        fetchEntries();
        // Reset form
        setCurrentEntry({
          date: new Date().toISOString().split("T")[0],
          content: "",
          mood: "productive",
          tech_used: [],
          achievements: [],
          blockers: [],
        });
      }
    } catch (error) {
      console.error("Error saving journal entry:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Loading journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Developer Journal</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Document your daily development journey
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Today's Entry Form */}
          <div className="p-6 rounded-lg border border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Today's Entry</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(currentEntry.date!).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Mood Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                How are you feeling?
              </label>
              <div className="flex gap-2 flex-wrap">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() =>
                      setCurrentEntry({ ...currentEntry, mood: mood.value })
                    }
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      currentEntry.mood === mood.value
                        ? "bg-accent border-2 border-primary"
                        : "bg-accent/50 border-2 border-transparent hover:bg-accent"
                    }`}
                  >
                    <span className="mr-1.5">{mood.icon}</span>
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                What did you work on today?
              </label>
              <Textarea
                placeholder="Describe your day, what you learned, challenges faced..."
                value={currentEntry.content || ""}
                onChange={(e) =>
                  setCurrentEntry({ ...currentEntry, content: e.target.value })
                }
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Achievements */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                  Achievements
                </label>
                <Textarea
                  placeholder="What went well?"
                  className="min-h-[80px] resize-none text-sm"
                />
              </div>

              {/* Blockers */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                  Blockers
                </label>
                <Textarea
                  placeholder="What's blocking you?"
                  className="min-h-[80px] resize-none text-sm"
                />
              </div>
            </div>

            <Button onClick={saveEntry} className="w-full">
              Save Entry
            </Button>
          </div>

          {/* Previous Entries */}
          {entries.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Previous Entries</h3>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {moods.find((m) => m.value === entry.mood)?.icon ||
                          "📝"}
                      </span>
                      <div>
                        <div className="font-medium">
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {moods.find((m) => m.value === entry.mood)?.label ||
                            entry.mood}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {entries.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Your Journal</h3>
              <p className="text-sm text-muted-foreground">
                Begin documenting your development journey today
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Brain, Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <span className="text-7xl block animate-pulse">🪶</span>
          <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10" />
        </div>
        <h1 className="text-3xl font-semibold mb-3">Notiq</h1>
        <div className="flex items-center justify-center gap-2 mt-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Loading your workspace...
          </p>
        </div>
      </div>
    </div>
  );
}

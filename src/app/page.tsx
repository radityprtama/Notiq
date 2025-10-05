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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <span className="text-7xl block mb-4 animate-pulse">🪶</span>
        <h1 className="text-2xl font-bold mb-2">Notiq</h1>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mt-4" />
        <p className="mt-4 text-muted-foreground">Loading your second brain...</p>
      </div>
    </div>
  );
}

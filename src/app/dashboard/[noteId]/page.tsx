"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function NotePage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    // Redirect to dashboard, the note will be selected there
    router.push("/dashboard");
  }, [router, params]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-muted-foreground">Loading note...</div>
    </div>
  );
}

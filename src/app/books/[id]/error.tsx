"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function BookError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="space-y-4">
      <p className="font-mono text-[10px] tracking-[0.22em] text-amber">READ FAIL</p>
      <h1 className="font-mono text-2xl tracking-wide">PANEL UNREADABLE</h1>
      <Button type="button" size="lg" className="h-11 px-4 font-mono" onClick={() => retry()}>
        RETRY
      </Button>
    </main>
  );
}

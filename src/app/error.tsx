"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
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
    <main>
      <h1 className="font-heading text-4xl tracking-tight">The stored day could not be read.</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
        This page only reads the local file. The failure did not fetch news and did not call a model.
      </p>
      <Button type="button" size="lg" className="mt-6 h-11 px-4" onClick={() => retry()}>
        Try again
      </Button>
    </main>
  );
}

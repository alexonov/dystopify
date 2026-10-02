import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MissingBook() {
  return (
    <main className="space-y-4">
      <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">UNKNOWN</p>
      <h1 className="font-mono text-2xl tracking-wide">SYMBOL NOT ON BOARD</h1>
      <Button variant="outline" size="lg" className="h-11 px-4 font-mono" render={<Link href="/" />}>
        BOARD
      </Button>
    </main>
  );
}

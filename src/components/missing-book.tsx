import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MissingBook() {
  return (
    <main>
      <h1 className="font-heading text-4xl tracking-tight">That book is not in the catalog.</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
        The meter covers ten books. The address does not match one of them.
      </p>
      <Button variant="outline" size="lg" className="mt-6 h-11 px-4" render={<Link href="/" />}>
        Back to the day
      </Button>
    </main>
  );
}

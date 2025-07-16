'use client';

import { Rocket } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-4xl items-center">
        <div className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Rocket className="h-6 w-6 text-accent" />
          PocketBalance
        </div>
      </div>
    </header>
  );
}

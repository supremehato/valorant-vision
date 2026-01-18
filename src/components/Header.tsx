import { Crosshair } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-lg group-hover:bg-primary/50 transition-colors" />
            <Crosshair className="w-8 h-8 text-primary relative" />
          </div>
          <span className="font-display font-bold text-xl tracking-wider">
            VAL<span className="text-primary">STATS</span>
          </span>
        </a>

        <nav className="flex items-center gap-6">
          <a 
            href="https://docs.henrikdev.xyz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            API Docs
          </a>
        </nav>
      </div>
    </header>
  );
}

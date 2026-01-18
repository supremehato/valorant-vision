import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PlayerSearchProps {
  onSearch: (name: string, tag: string) => void;
  isLoading?: boolean;
}

export function PlayerSearch({ onSearch, isLoading }: PlayerSearchProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Parse input - supports "Name#TAG" format
    const parts = input.trim().split('#');
    
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      setError('Please enter a valid Riot ID (e.g., Player#TAG)');
      return;
    }

    onSearch(parts[0], parts[1]);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="relative group">
        {/* Animated border glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300" />
        
        <div className="relative flex gap-2 p-1 bg-card rounded-lg border border-border">
          <Input
            type="text"
            placeholder="Enter Riot ID (e.g., Player#TAG)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground font-medium"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-all duration-300"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-destructive text-center animate-fade-in">
          {error}
        </p>
      )}
    </form>
  );
}

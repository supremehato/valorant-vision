import { useState } from 'react';
import { PlayerSearch } from '@/components/PlayerSearch';
import { PlayerCard } from '@/components/PlayerCard';
import { MatchHistory } from '@/components/MatchHistory';
import { StatsOverview } from '@/components/StatsOverview';
import { Header } from '@/components/Header';
import { fetchPlayerStats } from '@/lib/valorantApi';
import { PlayerStats } from '@/types/valorant';
import { Crosshair, Target, TrendingUp, Shield, AlertCircle } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (name: string, tag: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const stats = await fetchPlayerStats(name, tag);
      
      if (!stats) {
        setError(`Player "${name}#${tag}" not found. Please check the Riot ID and try again.`);
        setPlayerStats(null);
      } else {
        setPlayerStats(stats);
      }
    } catch (err) {
      setError('Failed to fetch player data. Please try again later.');
      setPlayerStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        
        <div className="container mx-auto px-4 relative z-10 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6 animate-fade-in">
              <Crosshair className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Free Valorant Stats Tracker</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              Track Your <span className="text-gradient-primary">Valorant</span> Progress
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              Get detailed statistics, rank info, and match history for any player. 
              Just enter a Riot ID to get started.
            </p>
            
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <PlayerSearch onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-4 pb-20 -mt-8">
        {error && (
          <div className="max-w-2xl mx-auto glass-card p-6 border-l-4 border-l-destructive animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <p className="text-foreground">{error}</p>
            </div>
          </div>
        )}

        {playerStats && (
          <div className="space-y-6">
            <PlayerCard account={playerStats.account} mmr={playerStats.mmr} />
            <StatsOverview mmr={playerStats.mmr} />
            <MatchHistory matches={playerStats.matches} />
          </div>
        )}

        {/* Feature Cards - Show when no search yet */}
        {!hasSearched && !isLoading && (
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title="Rank Tracking"
              description="See your current rank, RR, and peak performance across all acts"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Match History"
              description="Analyze your recent games with detailed K/D/A stats"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Season Stats"
              description="Track your progress with wins, games played, and win rates"
            />
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Powered by{' '}
            <a 
              href="https://docs.henrikdev.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Henrik's Valorant API
            </a>
            . Not affiliated with Riot Games.
          </p>
        </div>
      </footer>
    </div>
  );
};

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass-card p-6 text-center group hover:border-primary/50 transition-colors animated-border animate-fade-in">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default Index;

import { ValorantAccount, ValorantMMR, getRankInfo, getRankImageUrl } from '@/types/valorant';
import { TrendingUp, TrendingDown, Minus, Trophy, Target } from 'lucide-react';

interface PlayerCardProps {
  account: ValorantAccount;
  mmr: ValorantMMR | null;
}

export function PlayerCard({ account, mmr }: PlayerCardProps) {
  const currentTier = mmr?.current?.tier?.id || 0;
  const peakTier = mmr?.peak?.tier?.id || 0;
  const rankInfo = getRankInfo(currentTier);
  const peakRankInfo = getRankInfo(peakTier);
  const rankImage = getRankImageUrl(currentTier);
  const rrChange = mmr?.current?.last_change || 0;

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Player Avatar & Basic Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-primary/50">
              <img
                src={account.card?.large || '/placeholder.svg'}
                alt={account.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-card px-2 py-0.5 rounded text-xs font-bold border border-border">
              Lvl {account.account_level}
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              {account.name}
              <span className="text-muted-foreground">#{account.tag}</span>
            </h2>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              {account.region.toUpperCase()} Region
            </p>
          </div>
        </div>

        {/* Rank Display */}
        <div className="flex-1 flex items-center justify-center md:justify-end gap-8">
          {/* Current Rank */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Current Rank</p>
            <div className="flex items-center gap-3">
              {rankImage ? (
                <img src={rankImage} alt={rankInfo.name} className="w-16 h-16 animate-float" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="text-left">
                <p className={`font-display font-bold text-xl text-${rankInfo.color}`}>
                  {rankInfo.name}
                </p>
                {mmr?.current && (
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-semibold">{mmr.current.rr} RR</span>
                    <span className={`flex items-center text-sm ${
                      rrChange > 0 ? 'text-green-500' : rrChange < 0 ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                      {rrChange > 0 ? <TrendingUp className="w-3 h-3" /> : 
                       rrChange < 0 ? <TrendingDown className="w-3 h-3" /> : 
                       <Minus className="w-3 h-3" />}
                      {rrChange > 0 ? '+' : ''}{rrChange}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Peak Rank */}
          {peakTier > 0 && (
            <div className="text-center border-l border-border pl-8">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Peak Rank
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src={getRankImageUrl(peakTier)} 
                  alt={peakRankInfo.name} 
                  className="w-12 h-12 opacity-80" 
                />
                <div className="text-left">
                  <p className={`font-display font-bold text-lg text-${peakRankInfo.color}`}>
                    {peakRankInfo.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {mmr?.peak?.season?.short}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

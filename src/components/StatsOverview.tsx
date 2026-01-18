import { ValorantMMR } from '@/types/valorant';
import { getRankInfo, getRankImageUrl } from '@/types/valorant';
import { Trophy, Calendar, Gamepad2 } from 'lucide-react';

interface StatsOverviewProps {
  mmr: ValorantMMR | null;
}

export function StatsOverview({ mmr }: StatsOverviewProps) {
  if (!mmr?.seasonal || mmr.seasonal.length === 0) {
    return null;
  }

  // Get the latest season data
  const currentSeason = mmr.seasonal[0];
  const winRate = currentSeason.games > 0 
    ? ((currentSeason.wins / currentSeason.games) * 100).toFixed(1) 
    : '0';

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
        <Gamepad2 className="w-5 h-5 text-accent" />
        Current Act Stats
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Season */}
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Season"
          value={currentSeason.season?.short || 'Current'}
          color="accent"
        />

        {/* Games Played */}
        <StatCard
          icon={<Gamepad2 className="w-5 h-5" />}
          label="Games"
          value={currentSeason.games.toString()}
          color="foreground"
        />

        {/* Wins */}
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Wins"
          value={currentSeason.wins.toString()}
          subValue={`${winRate}% Win Rate`}
          color="green-500"
        />

        {/* Act Rank */}
        {currentSeason.end_tier && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <img 
                src={getRankImageUrl(currentSeason.end_tier.id)} 
                alt={currentSeason.end_tier.name}
                className="w-8 h-8"
              />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Act Rank</span>
            </div>
            <p className="font-display font-bold text-lg">
              {getRankInfo(currentSeason.end_tier.id).name}
            </p>
          </div>
        )}
      </div>

      {/* Act Wins Triangle */}
      {currentSeason.act_wins && currentSeason.act_wins.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-3">Act Rank Wins</p>
          <div className="flex flex-wrap gap-2">
            {currentSeason.act_wins.slice(0, 9).map((win, index) => (
              <div 
                key={index}
                className="w-8 h-8 rounded border border-border/50 overflow-hidden"
                title={win.name}
              >
                <img 
                  src={getRankImageUrl(win.id)} 
                  alt={win.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color?: string;
}

function StatCard({ icon, label, value, subValue, color = 'foreground' }: StatCardProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className={`flex items-center gap-2 mb-2 text-${color}`}>
        {icon}
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={`font-display font-bold text-2xl text-${color}`}>{value}</p>
      {subValue && (
        <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
      )}
    </div>
  );
}

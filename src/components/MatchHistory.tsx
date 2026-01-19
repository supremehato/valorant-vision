import { useState } from 'react';
import { MatchHistoryEntry } from '@/types/valorant';
import { formatDistanceToNow } from 'date-fns';
import { Skull, Crosshair, Users, Clock, Swords, ChevronRight, Target, Zap } from 'lucide-react';
import { MatchDetail } from './MatchDetail';

interface MatchHistoryProps {
  matches: MatchHistoryEntry[];
  playerPuuid: string;
  onPlayerSearch?: (name: string, tag: string) => void;
}

export function MatchHistory({ matches, playerPuuid, onPlayerSearch }: MatchHistoryProps) {
  const [selectedMatch, setSelectedMatch] = useState<MatchHistoryEntry | null>(null);

  if (!matches || matches.length === 0) {
    return (
      <div className="glass-card p-6 text-center animate-fade-in">
        <p className="text-muted-foreground">No recent matches found</p>
      </div>
    );
  }

  const handlePlayerClick = (name: string, tag: string) => {
    setSelectedMatch(null);
    onPlayerSearch?.(name, tag);
  };

  return (
    <>
      <div className="space-y-4 animate-fade-in">
        <h3 className="font-display text-xl font-bold flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" />
          Recent Matches
          <span className="text-sm font-normal text-muted-foreground ml-2">
            Click to view scoreboard
          </span>
        </h3>
        
        <div className="space-y-3">
          {matches.map((match, index) => (
            <MatchCard 
              key={match.metadata?.match_id || index} 
              match={match} 
              index={index}
              playerPuuid={playerPuuid}
              onClick={() => setSelectedMatch(match)}
            />
          ))}
        </div>
      </div>

      <MatchDetail 
        match={selectedMatch}
        playerPuuid={playerPuuid}
        open={!!selectedMatch}
        onOpenChange={(open) => !open && setSelectedMatch(null)}
        onPlayerClick={handlePlayerClick}
      />
    </>
  );
}

interface MatchCardProps {
  match: MatchHistoryEntry;
  index: number;
  playerPuuid: string;
  onClick: () => void;
}

function MatchCard({ match, index, playerPuuid, onClick }: MatchCardProps) {
  const metadata = match.metadata;
  const players = match.players;
  const teams = match.teams;
  
  // Guard against missing data
  if (!metadata || !players || !teams) {
    return null;
  }
  
  // Find the player in the match
  const player = players.find(p => p.puuid === playerPuuid);
  if (!player) {
    return null;
  }
  
  const playerStats = player.stats;
  const playerTeamId = player.team_id;
  
  // Find the player's team
  const playerTeam = teams.find(t => t.team_id === playerTeamId);
  const won = playerTeam?.won ?? false;
  
  const kda = playerStats.deaths > 0 
    ? ((playerStats.kills + playerStats.assists) / playerStats.deaths).toFixed(2) 
    : (playerStats.kills + playerStats.assists).toFixed(2);
  
  // Calculate HS%
  const totalShots = playerStats.headshots + playerStats.bodyshots + playerStats.legshots;
  const headshotPercent = totalShots > 0 
    ? Math.round((playerStats.headshots / totalShots) * 100) 
    : 0;

  const gameTime = metadata.started_at 
    ? formatDistanceToNow(new Date(metadata.started_at), { addSuffix: true })
    : 'Unknown';
  const duration = metadata.game_length_in_ms 
    ? Math.round(metadata.game_length_in_ms / 60000) 
    : 0;

  const roundsWon = playerTeam?.rounds?.won ?? 0;
  const roundsLost = playerTeam?.rounds?.lost ?? 0;

  return (
    <div 
      onClick={onClick}
      className={`glass-card p-4 border-l-4 transition-all hover:translate-x-1 cursor-pointer group ${
        won ? 'border-l-green-500 hover:border-l-green-400' : 'border-l-red-500 hover:border-l-red-400'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Match Result & Map */}
        <div className="flex items-center gap-4 min-w-[180px]">
          <div className={`px-3 py-1 rounded font-display font-bold text-sm ${
            won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {won ? 'VICTORY' : 'DEFEAT'}
          </div>
          <div>
            <p className="font-semibold text-foreground">{metadata.map?.name || 'Unknown Map'}</p>
            <p className="text-xs text-muted-foreground">{metadata.queue?.name || 'Competitive'}</p>
          </div>
        </div>

        {/* Agent */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            <img
              src={`https://media.valorant-api.com/agents/${player.agent?.id}/displayicon.png`}
              alt={player.agent?.name || 'Agent'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <span className="font-medium text-foreground">{player.agent?.name || 'Unknown'}</span>
        </div>

        {/* Score */}
        <div className="font-display font-bold text-lg text-center min-w-[80px]">
          <span className={won ? 'text-green-400' : 'text-foreground'}>
            {roundsWon}
          </span>
          <span className="text-muted-foreground mx-1">-</span>
          <span className={!won ? 'text-red-400' : 'text-foreground'}>
            {roundsLost}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-green-500" />
            <span className="text-foreground font-semibold">{playerStats.kills}</span>
          </div>
          <div className="flex items-center gap-2">
            <Skull className="w-4 h-4 text-red-500" />
            <span className="text-foreground font-semibold">{playerStats.deaths}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-foreground font-semibold">{playerStats.assists}</span>
          </div>
          <div className="hidden md:block px-2 py-1 bg-muted rounded text-sm font-semibold">
            KDA: {kda}
          </div>
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
            <Target className="w-3 h-3 text-yellow-400" />
            <span className="font-semibold">{headshotPercent}%</span>
          </div>
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
            <Zap className="w-3 h-3 text-accent" />
            <span className="font-semibold">{playerStats.score}</span>
          </div>
        </div>

        {/* Time & Arrow */}
        <div className="flex items-center gap-4">
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" />
              {duration}m
            </div>
            <div>{gameTime}</div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
}

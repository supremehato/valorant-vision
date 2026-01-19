import { MatchHistoryEntry, MatchPlayer, getRankImageUrl } from '@/types/valorant';
import { formatDistanceToNow } from 'date-fns';
import { X, Crosshair, Skull, Users, Zap, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MatchDetailProps {
  match: MatchHistoryEntry | null;
  playerPuuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MatchDetail({ match, playerPuuid, open, onOpenChange }: MatchDetailProps) {
  if (!match) return null;

  const metadata = match.metadata;
  const players = match.players;
  const teams = match.teams;

  // Separate players by team
  const bluePlayers = players.filter(p => p.team_id === 'Blue');
  const redPlayers = players.filter(p => p.team_id === 'Red');

  // Get team results
  const blueTeam = teams.find(t => t.team_id === 'Blue');
  const redTeam = teams.find(t => t.team_id === 'Red');

  const gameTime = metadata.started_at 
    ? formatDistanceToNow(new Date(metadata.started_at), { addSuffix: true })
    : 'Unknown';
  const duration = metadata.game_length_in_ms 
    ? Math.round(metadata.game_length_in_ms / 60000) 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-4">
            <span>{metadata.map?.name || 'Unknown Map'}</span>
            <span className="text-muted-foreground text-base font-normal">
              {metadata.queue?.name || 'Competitive'} • {duration}m • {gameTime}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Score Header */}
        <div className="flex items-center justify-center gap-8 py-6">
          <div className="text-center">
            <p className="text-sm text-blue-400 uppercase tracking-wider mb-1">Blue Team</p>
            <p className={`font-display text-5xl font-bold ${blueTeam?.won ? 'text-blue-400' : 'text-muted-foreground'}`}>
              {blueTeam?.rounds?.won ?? 0}
            </p>
          </div>
          <div className="text-3xl text-muted-foreground">-</div>
          <div className="text-center">
            <p className="text-sm text-red-400 uppercase tracking-wider mb-1">Red Team</p>
            <p className={`font-display text-5xl font-bold ${redTeam?.won ? 'text-red-400' : 'text-muted-foreground'}`}>
              {redTeam?.rounds?.won ?? 0}
            </p>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="space-y-6">
          {/* Blue Team */}
          <TeamScoreboard 
            players={bluePlayers} 
            teamName="Blue Team" 
            teamColor="blue" 
            won={blueTeam?.won ?? false}
            playerPuuid={playerPuuid}
          />

          {/* Red Team */}
          <TeamScoreboard 
            players={redPlayers} 
            teamName="Red Team" 
            teamColor="red" 
            won={redTeam?.won ?? false}
            playerPuuid={playerPuuid}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TeamScoreboardProps {
  players: MatchPlayer[];
  teamName: string;
  teamColor: 'blue' | 'red';
  won: boolean;
  playerPuuid: string;
}

function TeamScoreboard({ players, teamName, teamColor, won, playerPuuid }: TeamScoreboardProps) {
  // Sort players by score (ACS)
  const sortedPlayers = [...players].sort((a, b) => b.stats.score - a.stats.score);

  return (
    <div className={`rounded-lg overflow-hidden border ${
      teamColor === 'blue' ? 'border-blue-500/30' : 'border-red-500/30'
    }`}>
      {/* Team Header */}
      <div className={`px-4 py-2 ${
        teamColor === 'blue' ? 'bg-blue-500/20' : 'bg-red-500/20'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`font-display font-bold ${
            teamColor === 'blue' ? 'text-blue-400' : 'text-red-400'
          }`}>
            {teamName} {won && '(Winner)'}
          </span>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
        <div className="col-span-4">Player</div>
        <div className="col-span-1 text-center">ACS</div>
        <div className="col-span-1 text-center">K</div>
        <div className="col-span-1 text-center">D</div>
        <div className="col-span-1 text-center">A</div>
        <div className="col-span-1 text-center">KDA</div>
        <div className="col-span-1 text-center">HS%</div>
        <div className="col-span-2 text-center">Damage</div>
      </div>

      {/* Players */}
      {sortedPlayers.map((player) => (
        <PlayerRow 
          key={player.puuid} 
          player={player} 
          isCurrentPlayer={player.puuid === playerPuuid}
        />
      ))}
    </div>
  );
}

interface PlayerRowProps {
  player: MatchPlayer;
  isCurrentPlayer: boolean;
}

function PlayerRow({ player, isCurrentPlayer }: PlayerRowProps) {
  const stats = player.stats;
  
  // Calculate derived stats
  const kda = stats.deaths > 0 
    ? ((stats.kills + stats.assists) / stats.deaths).toFixed(2) 
    : (stats.kills + stats.assists).toFixed(2);
  
  const totalShots = stats.headshots + stats.bodyshots + stats.legshots;
  const headshotPercent = totalShots > 0 
    ? Math.round((stats.headshots / totalShots) * 100) 
    : 0;

  // Calculate ACS (Average Combat Score) - score divided by rounds (approximation)
  const acs = Math.round(stats.score / 20); // Rough estimate, actual would need round count

  return (
    <div className={`grid grid-cols-12 gap-2 px-4 py-3 border-t border-border/50 items-center ${
      isCurrentPlayer ? 'bg-primary/10' : 'hover:bg-muted/20'
    }`}>
      {/* Player Info */}
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          <img
            src={`https://media.valorant-api.com/agents/${player.agent?.id}/displayicon.png`}
            alt={player.agent?.name || 'Agent'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium truncate ${isCurrentPlayer ? 'text-primary' : 'text-foreground'}`}>
              {player.name}
            </span>
            <span className="text-muted-foreground text-xs">#{player.tag}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{player.agent?.name}</span>
            {player.tier?.id > 0 && (
              <>
                <span>•</span>
                <img 
                  src={getRankImageUrl(player.tier.id)} 
                  alt={player.tier.name}
                  className="w-4 h-4"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ACS */}
      <div className="col-span-1 text-center">
        <span className="font-display font-bold text-accent">{stats.score}</span>
      </div>

      {/* K/D/A */}
      <div className="col-span-1 text-center">
        <span className="font-semibold text-green-400">{stats.kills}</span>
      </div>
      <div className="col-span-1 text-center">
        <span className="font-semibold text-red-400">{stats.deaths}</span>
      </div>
      <div className="col-span-1 text-center">
        <span className="font-semibold text-muted-foreground">{stats.assists}</span>
      </div>

      {/* KDA Ratio */}
      <div className="col-span-1 text-center">
        <span className={`font-semibold ${
          parseFloat(kda) >= 1.5 ? 'text-green-400' : 
          parseFloat(kda) >= 1 ? 'text-foreground' : 'text-red-400'
        }`}>
          {kda}
        </span>
      </div>

      {/* HS% */}
      <div className="col-span-1 text-center">
        <span className={`font-semibold ${
          headshotPercent >= 25 ? 'text-yellow-400' : 'text-muted-foreground'
        }`}>
          {headshotPercent}%
        </span>
      </div>

      {/* Damage */}
      <div className="col-span-2 text-center text-sm">
        <span className="text-green-400">{stats.damage.dealt}</span>
        <span className="text-muted-foreground mx-1">/</span>
        <span className="text-red-400">{stats.damage.received}</span>
      </div>
    </div>
  );
}

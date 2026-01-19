import { MatchHistoryEntry, MatchPlayer, getRankImageUrl } from '@/types/valorant';
import { formatDistanceToNow } from 'date-fns';
import { Trophy, Skull, Target, Crosshair } from 'lucide-react';
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
  onPlayerClick?: (name: string, tag: string) => void;
}

export function MatchDetail({ match, playerPuuid, open, onOpenChange, onPlayerClick }: MatchDetailProps) {
  if (!match) return null;

  const metadata = match.metadata;
  const players = match.players;
  const teams = match.teams;

  const bluePlayers = players.filter(p => p.team_id === 'Blue');
  const redPlayers = players.filter(p => p.team_id === 'Red');

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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-4">
            {metadata.map?.id && (
              <div className="w-20 h-12 rounded-lg overflow-hidden border border-border/50">
                <img
                  src={`https://media.valorant-api.com/maps/${metadata.map.id}/listviewicon.png`}
                  alt={metadata.map.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <DialogTitle className="font-display text-2xl">
                {metadata.map?.name || 'Unknown Map'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {metadata.queue?.name || 'Competitive'} • {duration} minutes • {gameTime}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Score Header */}
        <div className="flex items-center justify-center gap-6 py-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-red-500/10 rounded-xl" />
          <div className="text-center relative z-10">
            <div className="flex items-center gap-2 justify-center mb-2">
              {blueTeam?.won && <Trophy className="w-5 h-5 text-yellow-400" />}
              <p className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Blue</p>
            </div>
            <p className={`font-display text-6xl font-bold ${blueTeam?.won ? 'text-blue-400' : 'text-blue-400/50'}`}>
              {blueTeam?.rounds?.won ?? 0}
            </p>
          </div>
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-border to-transparent" />
          <div className="text-center relative z-10">
            <div className="flex items-center gap-2 justify-center mb-2">
              {redTeam?.won && <Trophy className="w-5 h-5 text-yellow-400" />}
              <p className="text-sm font-semibold text-red-400 uppercase tracking-wider">Red</p>
            </div>
            <p className={`font-display text-6xl font-bold ${redTeam?.won ? 'text-red-400' : 'text-red-400/50'}`}>
              {redTeam?.rounds?.won ?? 0}
            </p>
          </div>
        </div>

        {/* Scoreboards */}
        <div className="space-y-4">
          <TeamScoreboard 
            players={bluePlayers} 
            teamColor="blue" 
            won={blueTeam?.won ?? false}
            playerPuuid={playerPuuid}
            onPlayerClick={onPlayerClick}
          />
          <TeamScoreboard 
            players={redPlayers} 
            teamColor="red" 
            won={redTeam?.won ?? false}
            playerPuuid={playerPuuid}
            onPlayerClick={onPlayerClick}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TeamScoreboardProps {
  players: MatchPlayer[];
  teamColor: 'blue' | 'red';
  won: boolean;
  playerPuuid: string;
  onPlayerClick?: (name: string, tag: string) => void;
}

function TeamScoreboard({ players, teamColor, won, playerPuuid, onPlayerClick }: TeamScoreboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.stats.score - a.stats.score);

  return (
    <div className={`rounded-xl overflow-hidden border ${
      teamColor === 'blue' ? 'border-blue-500/30 bg-blue-500/5' : 'border-red-500/30 bg-red-500/5'
    }`}>
      {/* Table Header */}
      <div className={`grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider ${
        teamColor === 'blue' ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'
      }`}>
        <div className="col-span-4 flex items-center gap-2">
          {won && <Trophy className="w-3 h-3 text-yellow-400" />}
          Player
        </div>
        <div className="col-span-1 text-center">Score</div>
        <div className="col-span-1 text-center">K</div>
        <div className="col-span-1 text-center">D</div>
        <div className="col-span-1 text-center">A</div>
        <div className="col-span-1 text-center">KDA</div>
        <div className="col-span-1 text-center flex items-center justify-center gap-1">
          <Crosshair className="w-3 h-3" />
          HS%
        </div>
        <div className="col-span-2 text-center">DMG</div>
      </div>

      {/* Players */}
      {sortedPlayers.map((player, idx) => (
        <PlayerRow 
          key={player.puuid} 
          player={player} 
          isCurrentPlayer={player.puuid === playerPuuid}
          isMVP={idx === 0}
          onPlayerClick={onPlayerClick}
        />
      ))}
    </div>
  );
}

interface PlayerRowProps {
  player: MatchPlayer;
  isCurrentPlayer: boolean;
  isMVP: boolean;
  onPlayerClick?: (name: string, tag: string) => void;
}

function PlayerRow({ player, isCurrentPlayer, isMVP, onPlayerClick }: PlayerRowProps) {
  const stats = player.stats;
  
  const kda = stats.deaths > 0 
    ? ((stats.kills + stats.assists) / stats.deaths).toFixed(2) 
    : (stats.kills + stats.assists).toFixed(2);
  
  const totalShots = stats.headshots + stats.bodyshots + stats.legshots;
  const headshotPercent = totalShots > 0 
    ? Math.round((stats.headshots / totalShots) * 100) 
    : 0;

  const handleClick = () => {
    if (onPlayerClick && player.name && player.tag) {
      onPlayerClick(player.name, player.tag);
    }
  };

  return (
    <div className={`grid grid-cols-12 gap-2 px-4 py-3 border-t border-border/30 items-center transition-colors ${
      isCurrentPlayer ? 'bg-primary/15 border-l-2 border-l-primary' : 'hover:bg-muted/30'
    }`}>
      {/* Player Info */}
      <div className="col-span-4 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-muted/50 overflow-hidden border border-border/50">
            <img
              src={`https://media.valorant-api.com/agents/${player.agent?.id}/displayicon.png`}
              alt={player.agent?.name || 'Agent'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          {isMVP && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
              <Target className="w-2.5 h-2.5 text-black" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <button
            onClick={handleClick}
            className={`font-medium truncate block text-left hover:text-primary transition-colors ${
              isCurrentPlayer ? 'text-primary' : 'text-foreground'
            }`}
          >
            {player.name}
            <span className="text-muted-foreground text-xs ml-1">#{player.tag}</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{player.agent?.name}</span>
            {player.tier?.id > 0 && (
              <img 
                src={getRankImageUrl(player.tier.id)} 
                alt={player.tier.name}
                className="w-4 h-4"
              />
            )}
          </div>
        </div>
      </div>

      {/* Score */}
      <div className="col-span-1 text-center">
        <span className="font-display font-bold text-accent">{stats.score}</span>
      </div>

      {/* K/D/A */}
      <div className="col-span-1 text-center">
        <span className="font-bold text-green-400">{stats.kills}</span>
      </div>
      <div className="col-span-1 text-center">
        <span className="font-bold text-red-400">{stats.deaths}</span>
      </div>
      <div className="col-span-1 text-center">
        <span className="text-muted-foreground">{stats.assists}</span>
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
        <span className="text-green-400 font-medium">{stats.damage.dealt}</span>
        <span className="text-muted-foreground mx-1">/</span>
        <span className="text-red-400">{stats.damage.received}</span>
      </div>
    </div>
  );
}

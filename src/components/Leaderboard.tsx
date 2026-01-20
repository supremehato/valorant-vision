import { useState, useEffect } from 'react';
import { Trophy, ChevronDown, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { getRankImageUrl } from '@/types/valorant';

interface LeaderboardPlayer {
  puuid: string;
  gameName: string;
  tagLine: string;
  leaderboardRank: number;
  rankedRating: number;
  numberOfWins: number;
  competitiveTier: number;
  PlayerCardID?: string;
}

interface LeaderboardProps {
  onPlayerSearch: (name: string, tag: string) => void;
}

const REGIONS = [
  { value: 'eu', label: 'Europe' },
  { value: 'na', label: 'North America' },
  { value: 'ap', label: 'Asia Pacific' },
  { value: 'kr', label: 'Korea' },
  { value: 'br', label: 'Brazil' },
  { value: 'latam', label: 'LATAM' },
];

const GAME_MODES = [
  { value: 'competitive', label: 'Competitive' },
  { value: 'premier', label: 'Premier' },
];

export function Leaderboard({ onPlayerSearch }: LeaderboardProps) {
  const [region, setRegion] = useState('eu');
  const [mode, setMode] = useState('competitive');
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [region, mode]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Only competitive leaderboard is reliably available
      // Premier leaderboard uses a different endpoint structure
      const endpoint = mode === 'competitive' 
        ? `/v3/leaderboard/${region}/pc`
        : `/v2/premier/leaderboard/${region}`;

      const { data, error: apiError } = await supabase.functions.invoke('valorant-api', {
        body: { endpoint },
      });

      if (apiError) throw apiError;

      // Handle 404 or missing data gracefully
      if (data?.status === 404 || data?.errors) {
        if (mode === 'premier') {
          setError('Premier leaderboard not available for this region');
        } else {
          setError('Leaderboard data not available');
        }
        setPlayers([]);
        return;
      }

      if (mode === 'competitive' && data?.data) {
        // Competitive leaderboard
        const playerData = Array.isArray(data.data) ? data.data : [];
        setPlayers(playerData.slice(0, 100).map((p: any) => ({
          puuid: p.puuid || '',
          gameName: p.gameName || p.name || 'Anonymous',
          tagLine: p.tagLine || p.tag || '',
          leaderboardRank: p.leaderboardRank || 0,
          rankedRating: p.rankedRating || 0,
          numberOfWins: p.numberOfWins || 0,
          competitiveTier: p.competitiveTier || 27,
        })));
      } else if (mode === 'premier' && data?.data) {
        // Premier leaderboard - teams structure
        const teamsData = Array.isArray(data.data) ? data.data : [];
        setPlayers(teamsData.slice(0, 100).map((team: any, index: number) => ({
          puuid: team.id || team.team_id || index.toString(),
          gameName: team.name || team.team_name || 'Team',
          tagLine: team.tag || team.team_tag || '',
          leaderboardRank: team.rank || index + 1,
          rankedRating: team.score || team.rating || 0,
          numberOfWins: team.wins || 0,
          competitiveTier: 27,
        })));
      } else {
        setPlayers([]);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(mode === 'premier' ? 'Premier leaderboard not available' : 'Failed to fetch leaderboard');
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="font-display text-xl font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-rank-radiant" />
          Top 500 Leaderboard
        </h3>

        <div className="flex items-center gap-4">
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[160px] bg-muted/50 border-border/50">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {REGIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Game Mode Tabs */}
      <Tabs value={mode} onValueChange={setMode} className="mb-6">
        <TabsList className="bg-muted/50 p-1 w-full md:w-auto">
          {GAME_MODES.map((m) => (
            <TabsTrigger
              key={m.value}
              value={m.value}
              className="flex-1 md:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
            >
              {m.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">{error}</div>
        ) : players.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No leaderboard data available
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-2 text-xs text-muted-foreground uppercase tracking-wider w-16">
                  Rank
                </th>
                <th className="text-left py-3 px-2 text-xs text-muted-foreground uppercase tracking-wider">
                  Player
                </th>
                <th className="text-right py-3 px-2 text-xs text-muted-foreground uppercase tracking-wider">
                  {mode === 'competitive' ? 'RR' : 'Score'}
                </th>
                <th className="text-right py-3 px-2 text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Wins
                </th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr
                  key={player.puuid}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => {
                    if (player.gameName && player.tagLine) {
                      onPlayerSearch(player.gameName, player.tagLine);
                    }
                  }}
                >
                  <td className="py-3 px-2">
                    <span className={`font-display font-bold ${
                      player.leaderboardRank === 1 ? 'text-rank-radiant' :
                      player.leaderboardRank <= 10 ? 'text-rank-immortal' :
                      player.leaderboardRank <= 50 ? 'text-rank-diamond' :
                      'text-foreground'
                    }`}>
                      #{player.leaderboardRank}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={getRankImageUrl(player.competitiveTier)}
                        alt="Rank"
                        className="w-6 h-6"
                      />
                      <div>
                        <p className="font-medium text-foreground hover:text-primary transition-colors">
                          {player.gameName}
                          {player.tagLine && (
                            <span className="text-muted-foreground">#{player.tagLine}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="font-display font-bold text-primary">
                      {player.rankedRating.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right hidden md:table-cell">
                    <span className="text-muted-foreground">
                      {player.numberOfWins}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

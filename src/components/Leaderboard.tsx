import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
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

export function Leaderboard({ onPlayerSearch }: LeaderboardProps) {
  const [region, setRegion] = useState('eu');
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [region]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Only competitive leaderboard is reliably available
      const endpoint = `/v3/leaderboard/${region}/pc`;

      const { data, error: apiError } = await supabase.functions.invoke('valorant-api', {
        body: { endpoint },
      });

      if (apiError) throw apiError;

      // Handle 404 or missing data gracefully
      if (data?.status === 404 || data?.errors) {
        setError('Leaderboard data not available');
        setPlayers([]);
        return;
      }

      // API returns { data: { players: [...] } }
      const playersData = data?.data?.players || data?.players || [];
      
      if (Array.isArray(playersData) && playersData.length > 0) {
        setPlayers(playersData.slice(0, 100).map((p: any) => ({
          puuid: p.puuid || '',
          gameName: p.name || 'Anonymous',
          tagLine: p.tag || '',
          leaderboardRank: p.leaderboard_rank || 0,
          rankedRating: p.rr || 0,
          numberOfWins: p.wins || 0,
          competitiveTier: p.tier || 27,
        })));
      } else {
        setPlayers([]);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to fetch leaderboard');
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
                  RR
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

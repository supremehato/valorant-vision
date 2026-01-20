import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatsOverview } from './StatsOverview';
import { MatchHistory } from './MatchHistory';
import { ValorantMMR, MatchHistoryEntry, MatchPlayer } from '@/types/valorant';
import { User, Crosshair, Map, History, Swords } from 'lucide-react';

interface PlayerStatsTabsProps {
  mmr: ValorantMMR | null;
  matches: MatchHistoryEntry[];
  playerPuuid: string;
  onPlayerSearch: (name: string, tag: string) => void;
}

interface AgentStat {
  name: string;
  iconUrl: string;
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  avgScore: number;
}

interface WeaponStat {
  name: string;
  kills: number;
  headshots: number;
}

interface MapStat {
  name: string;
  games: number;
  wins: number;
}

export function PlayerStatsTabs({ mmr, matches, playerPuuid, onPlayerSearch }: PlayerStatsTabsProps) {
  // Calculate agent stats from match history
  const agentStats = calculateAgentStats(matches, playerPuuid);
  const mapStats = calculateMapStats(matches, playerPuuid);

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full bg-muted/50 p-1 flex flex-wrap justify-start gap-1 h-auto">
        <TabsTrigger 
          value="overview" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger 
          value="matches" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">Matches</span>
        </TabsTrigger>
        <TabsTrigger 
          value="agents" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Swords className="w-4 h-4" />
          <span className="hidden sm:inline">Agents</span>
        </TabsTrigger>
        <TabsTrigger 
          value="maps" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Map className="w-4 h-4" />
          <span className="hidden sm:inline">Maps</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <StatsOverview mmr={mmr} />
      </TabsContent>

      <TabsContent value="matches" className="mt-6">
        <MatchHistory 
          matches={matches} 
          playerPuuid={playerPuuid}
          onPlayerSearch={onPlayerSearch}
        />
      </TabsContent>

      <TabsContent value="agents" className="mt-6">
        <AgentStatsDisplay agents={agentStats} />
      </TabsContent>

      <TabsContent value="maps" className="mt-6">
        <MapStatsDisplay maps={mapStats} />
      </TabsContent>
    </Tabs>
  );
}

function calculateAgentStats(matches: MatchHistoryEntry[], playerPuuid: string): AgentStat[] {
  const agentMap: Record<string, AgentStat> = {};

  matches.forEach(match => {
    const player = match.players?.find(p => p.puuid === playerPuuid);
    if (!player || !player.agent) return;

    const team = match.teams?.find(t => t.team_id === player.team_id);
    const won = team?.won || false;
    const agentName = player.agent.name;

    if (!agentMap[agentName]) {
      agentMap[agentName] = {
        name: player.agent.name,
        iconUrl: `https://media.valorant-api.com/agents/${player.agent.id}/displayicon.png`,
        games: 0,
        wins: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
        avgScore: 0,
      };
    }

    agentMap[agentName].games++;
    if (won) agentMap[agentName].wins++;
    agentMap[agentName].kills += player.stats?.kills || 0;
    agentMap[agentName].deaths += player.stats?.deaths || 0;
    agentMap[agentName].assists += player.stats?.assists || 0;
    agentMap[agentName].avgScore += player.stats?.score || 0;
  });

  // Calculate averages
  const result: AgentStat[] = Object.values(agentMap).map(agent => ({
    ...agent,
    avgScore: agent.games > 0 ? Math.round(agent.avgScore / agent.games) : 0,
  }));

  return result.sort((a, b) => b.games - a.games);
}

function calculateMapStats(matches: MatchHistoryEntry[], playerPuuid: string): MapStat[] {
  const mapStats: Record<string, MapStat> = {};

  matches.forEach(match => {
    const player = match.players?.find(p => p.puuid === playerPuuid);
    if (!player || !match.metadata?.map) return;

    const team = match.teams?.find(t => t.team_id === player.team_id);
    const won = team?.won || false;
    const mapName = match.metadata.map.name;

    if (!mapStats[mapName]) {
      mapStats[mapName] = {
        name: mapName,
        games: 0,
        wins: 0,
      };
    }

    mapStats[mapName].games++;
    if (won) mapStats[mapName].wins++;
  });

  const result: MapStat[] = Object.values(mapStats);
  return result.sort((a, b) => b.games - a.games);
}

function AgentStatsDisplay({ agents }: { agents: AgentStat[] }) {
  if (agents.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-muted-foreground">
        No agent data available from recent matches
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
        <Swords className="w-5 h-5 text-accent" />
        Agent Performance
      </h3>
      <div className="grid gap-4">
        {agents.map((agent) => {
          const winRate = agent.games > 0 ? ((agent.wins / agent.games) * 100).toFixed(0) : '0';
          const kda = agent.deaths > 0 
            ? ((agent.kills + agent.assists) / agent.deaths).toFixed(2) 
            : (agent.kills + agent.assists).toFixed(2);

          return (
            <div 
              key={agent.name}
              className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <img 
                src={agent.iconUrl}
                alt={agent.name}
                className="w-12 h-12 rounded-lg bg-card"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-lg">{agent.name}</p>
                <p className="text-sm text-muted-foreground">
                  {agent.games} games · {winRate}% WR
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">K/D/A</p>
                  <p className="font-display font-bold">
                    {agent.kills}/{agent.deaths}/{agent.assists}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">KDA</p>
                  <p className="font-display font-bold text-accent">{kda}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="font-display font-bold">{agent.avgScore}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MapStatsDisplay({ maps }: { maps: MapStat[] }) {
  if (maps.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-muted-foreground">
        No map data available from recent matches
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
        <Map className="w-5 h-5 text-accent" />
        Map Performance
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        {maps.map((map) => {
          const winRate = map.games > 0 ? ((map.wins / map.games) * 100).toFixed(0) : '0';

          return (
            <div 
              key={map.name}
              className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-display font-bold text-lg">{map.name}</p>
                <span className={`text-sm font-medium ${
                  parseInt(winRate) >= 50 ? 'text-green-500' : 'text-destructive'
                }`}>
                  {winRate}% WR
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{map.games} games</span>
                <span>{map.wins}W - {map.games - map.wins}L</span>
              </div>
              {/* Win rate progress bar */}
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    parseInt(winRate) >= 50 ? 'bg-green-500' : 'bg-destructive'
                  }`}
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

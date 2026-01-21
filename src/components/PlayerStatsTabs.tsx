import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatsOverview } from './StatsOverview';
import { MatchHistory } from './MatchHistory';
import { ValorantMMR, MatchHistoryEntry, MatchPlayer } from '@/types/valorant';
import { User, Crosshair, Map, History, Swords, Target } from 'lucide-react';

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

interface OverallStats {
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  totalHeadshots: number;
  totalBodyshots: number;
  totalLegshots: number;
  totalDamageDealt: number;
  totalDamageReceived: number;
  totalGames: number;
  totalWins: number;
}

export function PlayerStatsTabs({ mmr, matches, playerPuuid, onPlayerSearch }: PlayerStatsTabsProps) {
  // Calculate stats from match history
  const agentStats = calculateAgentStats(matches, playerPuuid);
  const mapStats = calculateMapStats(matches, playerPuuid);
  const overallStats = calculateOverallStats(matches, playerPuuid);

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
          value="accuracy" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Target className="w-4 h-4" />
          <span className="hidden sm:inline">Accuracy</span>
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

      <TabsContent value="accuracy" className="mt-6">
        <AccuracyStatsDisplay stats={overallStats} />
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

function calculateOverallStats(matches: MatchHistoryEntry[], playerPuuid: string): OverallStats {
  const stats: OverallStats = {
    totalKills: 0,
    totalDeaths: 0,
    totalAssists: 0,
    totalHeadshots: 0,
    totalBodyshots: 0,
    totalLegshots: 0,
    totalDamageDealt: 0,
    totalDamageReceived: 0,
    totalGames: 0,
    totalWins: 0,
  };

  matches.forEach(match => {
    const player = match.players?.find(p => p.puuid === playerPuuid);
    if (!player) return;

    const team = match.teams?.find(t => t.team_id === player.team_id);
    const won = team?.won || false;

    stats.totalGames++;
    if (won) stats.totalWins++;
    stats.totalKills += player.stats?.kills || 0;
    stats.totalDeaths += player.stats?.deaths || 0;
    stats.totalAssists += player.stats?.assists || 0;
    stats.totalHeadshots += player.stats?.headshots || 0;
    stats.totalBodyshots += player.stats?.bodyshots || 0;
    stats.totalLegshots += player.stats?.legshots || 0;
    stats.totalDamageDealt += player.stats?.damage?.dealt || 0;
    stats.totalDamageReceived += player.stats?.damage?.received || 0;
  });

  return stats;
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

function AccuracyStatsDisplay({ stats }: { stats: OverallStats }) {
  const totalShots = stats.totalHeadshots + stats.totalBodyshots + stats.totalLegshots;
  const headshotPercent = totalShots > 0 ? ((stats.totalHeadshots / totalShots) * 100).toFixed(1) : '0';
  const bodyshotPercent = totalShots > 0 ? ((stats.totalBodyshots / totalShots) * 100).toFixed(1) : '0';
  const legshotPercent = totalShots > 0 ? ((stats.totalLegshots / totalShots) * 100).toFixed(1) : '0';
  const kd = stats.totalDeaths > 0 ? (stats.totalKills / stats.totalDeaths).toFixed(2) : stats.totalKills.toFixed(2);
  const kda = stats.totalDeaths > 0 
    ? ((stats.totalKills + stats.totalAssists) / stats.totalDeaths).toFixed(2) 
    : (stats.totalKills + stats.totalAssists).toFixed(2);
  const winRate = stats.totalGames > 0 ? ((stats.totalWins / stats.totalGames) * 100).toFixed(0) : '0';
  const avgDamagePerGame = stats.totalGames > 0 ? Math.round(stats.totalDamageDealt / stats.totalGames) : 0;

  if (stats.totalGames === 0) {
    return (
      <div className="glass-card p-6 text-center text-muted-foreground">
        No accuracy data available from recent matches
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Combat Stats */}
      <div className="glass-card p-6">
        <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-accent" />
          Combat Statistics ({stats.totalGames} matches)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">K/D Ratio</p>
            <p className={`font-display text-2xl font-bold ${parseFloat(kd) >= 1 ? 'text-green-500' : 'text-destructive'}`}>
              {kd}
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">KDA</p>
            <p className="font-display text-2xl font-bold text-accent">{kda}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className={`font-display text-2xl font-bold ${parseInt(winRate) >= 50 ? 'text-green-500' : 'text-destructive'}`}>
              {winRate}%
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Avg Damage</p>
            <p className="font-display text-2xl font-bold">{avgDamagePerGame}</p>
          </div>
        </div>
      </div>

      {/* Kill Stats */}
      <div className="glass-card p-6">
        <h3 className="font-display text-lg font-bold mb-4">Total Kills / Deaths / Assists</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Kills</p>
            <p className="font-display text-3xl font-bold text-green-500">{stats.totalKills}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Deaths</p>
            <p className="font-display text-3xl font-bold text-destructive">{stats.totalDeaths}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Assists</p>
            <p className="font-display text-3xl font-bold text-muted-foreground">{stats.totalAssists}</p>
          </div>
        </div>
      </div>

      {/* Shot Distribution */}
      <div className="glass-card p-6">
        <h3 className="font-display text-lg font-bold mb-4">Shot Distribution</h3>
        <div className="space-y-4">
          {/* Headshots */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Headshots</span>
              <span className="text-sm text-accent font-bold">{headshotPercent}% ({stats.totalHeadshots})</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all"
                style={{ width: `${headshotPercent}%` }}
              />
            </div>
          </div>
          {/* Bodyshots */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Bodyshots</span>
              <span className="text-sm text-primary font-bold">{bodyshotPercent}% ({stats.totalBodyshots})</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${bodyshotPercent}%` }}
              />
            </div>
          </div>
          {/* Legshots */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Legshots</span>
              <span className="text-sm text-muted-foreground font-bold">{legshotPercent}% ({stats.totalLegshots})</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-muted-foreground transition-all"
                style={{ width: `${legshotPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Damage Stats */}
      <div className="glass-card p-6">
        <h3 className="font-display text-lg font-bold mb-4">Damage Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Total Damage Dealt</p>
            <p className="font-display text-2xl font-bold text-green-500">{stats.totalDamageDealt.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Total Damage Received</p>
            <p className="font-display text-2xl font-bold text-destructive">{stats.totalDamageReceived.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

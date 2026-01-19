// Valorant API Types
export interface ValorantAccount {
  puuid: string;
  region: string;
  account_level: number;
  name: string;
  tag: string;
  card: {
    small: string;
    large: string;
    wide: string;
    id: string;
  };
  last_update: string;
  last_update_raw: number;
}

export interface ValorantMMR {
  account: {
    name: string;
    tag: string;
    puuid: string;
  };
  current: {
    tier: {
      id: number;
      name: string;
    };
    rr: number;
    last_change: number;
    elo: number;
    games_needed_for_rating: number;
  };
  peak: {
    season: {
      id: string;
      short: string;
    };
    tier: {
      id: number;
      name: string;
    };
  };
  seasonal: SeasonalData[];
}

export interface SeasonalData {
  season: {
    id: string;
    short: string;
  };
  wins: number;
  games: number;
  end_tier: {
    id: number;
    name: string;
  };
  end_rr: number;
  act_wins: {
    id: number;
    name: string;
  }[];
}

// Match history v4 API response structure
export interface MatchHistoryEntry {
  metadata: {
    match_id: string;
    map: {
      id: string;
      name: string;
    };
    started_at: string;
    game_length_in_ms: number;
    region: string;
    queue: {
      id: string;
      name: string;
    };
    season: {
      id: string;
      short: string;
    };
  };
  players: MatchPlayer[];
  teams: MatchTeam[];
}

export interface MatchPlayer {
  puuid: string;
  name: string;
  tag: string;
  team_id: string;
  agent: {
    id: string;
    name: string;
  };
  stats: {
    score: number;
    kills: number;
    deaths: number;
    assists: number;
    headshots: number;
    bodyshots: number;
    legshots: number;
    damage: {
      dealt: number;
      received: number;
    };
  };
  tier: {
    id: number;
    name: string;
  };
  account_level: number;
}

export interface MatchTeam {
  team_id: string;
  rounds: {
    won: number;
    lost: number;
  };
  won: boolean;
}

export interface PlayerStats {
  account: ValorantAccount;
  mmr: ValorantMMR | null;
  matches: MatchHistoryEntry[];
}

// Rank tier mapping
export const RANK_TIERS: Record<number, { name: string; color: string }> = {
  0: { name: 'Unrated', color: 'muted-foreground' },
  1: { name: 'Unused 1', color: 'muted-foreground' },
  2: { name: 'Unused 2', color: 'muted-foreground' },
  3: { name: 'Iron 1', color: 'rank-iron' },
  4: { name: 'Iron 2', color: 'rank-iron' },
  5: { name: 'Iron 3', color: 'rank-iron' },
  6: { name: 'Bronze 1', color: 'rank-bronze' },
  7: { name: 'Bronze 2', color: 'rank-bronze' },
  8: { name: 'Bronze 3', color: 'rank-bronze' },
  9: { name: 'Silver 1', color: 'rank-silver' },
  10: { name: 'Silver 2', color: 'rank-silver' },
  11: { name: 'Silver 3', color: 'rank-silver' },
  12: { name: 'Gold 1', color: 'rank-gold' },
  13: { name: 'Gold 2', color: 'rank-gold' },
  14: { name: 'Gold 3', color: 'rank-gold' },
  15: { name: 'Platinum 1', color: 'rank-platinum' },
  16: { name: 'Platinum 2', color: 'rank-platinum' },
  17: { name: 'Platinum 3', color: 'rank-platinum' },
  18: { name: 'Diamond 1', color: 'rank-diamond' },
  19: { name: 'Diamond 2', color: 'rank-diamond' },
  20: { name: 'Diamond 3', color: 'rank-diamond' },
  21: { name: 'Ascendant 1', color: 'rank-ascendant' },
  22: { name: 'Ascendant 2', color: 'rank-ascendant' },
  23: { name: 'Ascendant 3', color: 'rank-ascendant' },
  24: { name: 'Immortal 1', color: 'rank-immortal' },
  25: { name: 'Immortal 2', color: 'rank-immortal' },
  26: { name: 'Immortal 3', color: 'rank-immortal' },
  27: { name: 'Radiant', color: 'rank-radiant' },
};

export function getRankInfo(tierId: number) {
  return RANK_TIERS[tierId] || { name: 'Unknown', color: 'muted-foreground' };
}

export function getRankImageUrl(tierId: number): string {
  // Using a CDN for rank images
  if (tierId < 3) return '';
  return `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${tierId}/smallicon.png`;
}

// Helper to get current season (last in array) from seasonal data
export function getCurrentSeason(seasonal: SeasonalData[] | undefined): SeasonalData | null {
  if (!seasonal || seasonal.length === 0) return null;
  // The current/latest season is the LAST in the array
  return seasonal[seasonal.length - 1];
}

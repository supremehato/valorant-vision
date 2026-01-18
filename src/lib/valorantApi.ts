import { ValorantAccount, ValorantMMR, MatchHistoryEntry } from '@/types/valorant';

const BASE_URL = 'https://api.henrikdev.xyz/valorant';

interface ApiResponse<T> {
  status: number;
  data: T;
}

export async function fetchAccount(name: string, tag: string): Promise<ValorantAccount | null> {
  try {
    const response = await fetch(`${BASE_URL}/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    const result: ApiResponse<ValorantAccount> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error;
  }
}

export async function fetchMMR(region: string, name: string, tag: string): Promise<ValorantMMR | null> {
  try {
    const response = await fetch(`${BASE_URL}/v3/mmr/${region}/pc/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      // Some players might not have MMR data
      return null;
    }
    
    const result: ApiResponse<ValorantMMR> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching MMR:', error);
    return null;
  }
}

export async function fetchMatchHistory(region: string, name: string, tag: string, size: number = 5): Promise<MatchHistoryEntry[]> {
  try {
    const response = await fetch(`${BASE_URL}/v4/matches/${region}/pc/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=${size}`);
    
    if (!response.ok) {
      return [];
    }
    
    const result: ApiResponse<MatchHistoryEntry[]> = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching match history:', error);
    return [];
  }
}

export async function fetchPlayerStats(name: string, tag: string) {
  const account = await fetchAccount(name, tag);
  
  if (!account) {
    return null;
  }
  
  const region = account.region || 'eu';
  
  const [mmr, matches] = await Promise.all([
    fetchMMR(region, name, tag),
    fetchMatchHistory(region, name, tag, 5),
  ]);
  
  return {
    account,
    mmr,
    matches,
  };
}

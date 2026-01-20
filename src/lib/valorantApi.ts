import { ValorantAccount, ValorantMMR, MatchHistoryEntry } from '@/types/valorant';
import { supabase } from '@/integrations/supabase/client';

interface ApiResponse<T> {
  status: number;
  data: T;
}

async function callValorantApi<T>(endpoint: string): Promise<T | null> {
  const { data, error } = await supabase.functions.invoke('valorant-api', {
    body: { endpoint },
  });

  if (error) {
    console.error('Error calling valorant-api:', error);
    throw error;
  }

  if (data?.status === 404) {
    return null;
  }

  if (data?.status && data.status >= 400) {
    throw new Error(data?.errors?.[0]?.message || 'API Error');
  }

  return data?.data || data;
}

export async function fetchAccount(name: string, tag: string): Promise<ValorantAccount | null> {
  try {
    const endpoint = `/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
    return await callValorantApi<ValorantAccount>(endpoint);
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error;
  }
}

export async function fetchMMR(region: string, name: string, tag: string): Promise<ValorantMMR | null> {
  try {
    const endpoint = `/v3/mmr/${region}/pc/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
    return await callValorantApi<ValorantMMR>(endpoint);
  } catch (error) {
    console.error('Error fetching MMR:', error);
    return null;
  }
}

export async function fetchMatchHistory(
  region: string, 
  name: string, 
  tag: string, 
  size: number = 5,
  mode?: string
): Promise<MatchHistoryEntry[]> {
  try {
    let endpoint = `/v4/matches/${region}/pc/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=${size}`;
    if (mode && mode !== 'all') {
      endpoint += `&mode=${mode}`;
    }
    const result = await callValorantApi<MatchHistoryEntry[]>(endpoint);
    return result || [];
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

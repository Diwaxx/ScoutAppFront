import { apiClient, createApiMethod } from '@shared/api/client.ts';
import type { Player, PlayerStats } from '@shared/types/';

export interface GetPlayersParams {
  search?: string;
  role?: string;
  minElo?: number;
  maxElo?: number;
  playstyle?: string;
  sortBy?: string;
  teamId?: string;
  limit?: number;
  offset?: number;
}

export interface GetPlayersResponse {
  items: Player[];
  total: number;
}

export const playerApi = {
  getPlayers: async (params: GetPlayersParams): Promise<GetPlayersResponse> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const query = searchParams.toString();
    return apiClient<GetPlayersResponse>(`/api/players${query ? `?${query}` : ''}`);
  },

  getPlayerById: (playerId: string): Promise<{ player: Player }> => {
    return apiClient<{ player: Player }>(`/api/players/${playerId}`);
  },

  getPlayerStats: (playerId: string): Promise<PlayerStats> => {
    return apiClient<PlayerStats>(`/api/players/${playerId}/stats`);
  },
};
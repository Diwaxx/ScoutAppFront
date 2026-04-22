import { apiClient } from '@shared/api/client';
import type { Team } from '@shared/types';

export interface TeamHealth {
  aggressionLevel: number;
  stabilityLevel: number;
  teamworkLevel: number;
  roleBalance: Array<{
    role: string;
    filled: boolean;
  }>;
  warnings: string[];
  recommendations: string[];
}

export const teamApi = {
  getTeam: (teamId: string): Promise<{ team: Team }> => {
    return apiClient<{ team: Team }>(`/api/teams/${teamId}`);
  },

  getTeamHealth: (teamId: string): Promise<TeamHealth> => {
    return apiClient<TeamHealth>(`/api/teams/${teamId}/health`);
  },
};
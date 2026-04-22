import { apiClient } from '@shared/api/client';
import type { CompatibilityResponse } from '@shared/types';

export const compatibilityApi = {
  getCompatibility: (teamId: string, playerId: string): Promise<CompatibilityResponse> => {
    return apiClient<CompatibilityResponse>(`/api/teams/${teamId}/compatibility/${playerId}`);
  },
};
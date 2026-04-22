import { apiClient } from '@shared/api/client';
import type { Candidate, CandidateStatus } from '@shared/types';

export interface CreateCandidateParams {
  playerId: string;
  status?: CandidateStatus;
  note?: string;
}

export interface UpdateCandidateParams {
  status?: CandidateStatus;
  note?: string;
}

export const candidateApi = {
  getCandidates: (teamId: string): Promise<{ items: Candidate[] }> => {
    return apiClient<{ items: Candidate[] }>(`/api/teams/${teamId}/candidates`);
  },

  createCandidate: (teamId: string, params: CreateCandidateParams): Promise<Candidate> => {
    return apiClient<Candidate>(`/api/teams/${teamId}/candidates`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  updateCandidate: (candidateId: string, params: UpdateCandidateParams): Promise<Candidate> => {
    return apiClient<Candidate>(`/api/candidates/${candidateId}`, {
      method: 'PATCH',
      body: JSON.stringify(params),
    });
  },

  deleteCandidate: (candidateId: string): Promise<void> => {
    return apiClient<void>(`/api/candidates/${candidateId}`, {
      method: 'DELETE',
    });
  },
};
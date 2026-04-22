import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateApi, type CreateCandidateParams } from '@entities/candidates/api/candidatesApi';
import { playerApi } from '@entities/player/api/playerApi';
import type { CandidateStatus } from '@shared/types';
import { clsx } from 'clsx';

const statusConfig: Record<CandidateStatus, { label: string; color: string }> = {
  considering: { label: 'Considering', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  testing: { label: 'Testing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  accepted: { label: 'Accepted', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const columns: { status: CandidateStatus; title: string }[] = [
  { status: 'considering', title: 'Considering' },
  { status: 'testing', title: 'Testing' },
  { status: 'accepted', title: 'Accepted' },
  { status: 'rejected', title: 'Rejected' },
];

export const CandidatesPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { data: candidatesData, isLoading } = useQuery({
    queryKey: ['candidates', teamId],
    queryFn: () => candidateApi.getCandidates(teamId!),
    enabled: !!teamId,
  });
  
  const { data: playersData } = useQuery({
    queryKey: ['players', searchQuery],
    queryFn: () => playerApi.getPlayers({ search: searchQuery, limit: 20 }),
    enabled: showAddModal,
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CandidateStatus }) =>
      candidateApi.updateCandidate(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', teamId] });
    },
  });
  
  const createMutation = useMutation({
    mutationFn: (params: CreateCandidateParams) =>
      candidateApi.createCandidate(teamId!, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', teamId] });
      setShowAddModal(false);
      setSearchQuery('');
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => candidateApi.deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', teamId] });
    },
  });
  
  const candidates = candidatesData?.items || [];
  
  const candidatesByStatus = columns.reduce((acc, { status }) => {
    acc[status] = candidates.filter((c) => c.status === status);
    return acc;
  }, {} as Record<CandidateStatus, typeof candidates>);
  
  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    e.dataTransfer.setData('candidateId', candidateId);
  };
  
  const handleDrop = (e: React.DragEvent, status: CandidateStatus) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('candidateId');
    updateMutation.mutate({ id: candidateId, status });
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Scout CRM</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-accent text-bg-1 rounded-lg font-medium hover:bg-accent/90 transition-colors"
        >
          Add Candidate
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-text">Loading candidates...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(({ status, title }) => (
            <div
              key={status}
              className="bg-card/30 rounded-xl p-3"
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={handleDragOver}
            >
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="text-sm font-medium text-text">{title}</h3>
                <span className="text-xs text-muted bg-white/10 px-2 py-0.5 rounded-full">
                  {candidatesByStatus[status].length}
                </span>
              </div>
              
              <div className="space-y-2">
                {candidatesByStatus[status].map((candidate) => (
                  <div
                    key={candidate.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, candidate.id)}
                    className="card p-3 cursor-move hover:border-accent/50 transition-colors"
                  >
                    <Link
                      to={`/players/${candidate.playerId}`}
                      className="block hover:text-accent transition-colors"
                    >
                      <div className="font-medium text-text">Player #{candidate.playerId}</div>
                    </Link>
                    
                    {candidate.compatibilityScore && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="text-xs text-muted">Compatibility</div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-text">
                            {candidate.compatibilityScore}
                          </span>
                          <span className="text-xs text-muted">/100</span>
                        </div>
                      </div>
                    )}
                    
                    {candidate.note && (
                      <p className="text-xs text-muted mt-2 line-clamp-2">{candidate.note}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full border', statusConfig[status].color)}>
                        {statusConfig[status].label}
                      </span>
                      
                      <button
                        onClick={() => deleteMutation.mutate(candidate.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                
                {candidatesByStatus[status].length === 0 && (
                  <div className="text-center py-8 text-xs text-muted">
                    Drop candidates here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-text mb-4">Add Candidate</h2>
            
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-card-border rounded-lg text-text placeholder-muted mb-4"
              autoFocus
            />
            
            <div className="max-h-64 overflow-y-auto space-y-1 mb-4">
              {playersData?.items.map((player) => (
                <button
                  key={player.id}
                  onClick={() => createMutation.mutate({ playerId: player.id, status: 'considering' })}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="font-medium text-text">{player.nickname}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {player.primaryRole && (
                      <span className="text-xs text-muted">{player.primaryRole}</span>
                    )}
                    {player.faceitElo && (
                      <span className="text-xs text-muted">ELO: {player.faceitElo}</span>
                    )}
                  </div>
                </button>
              ))}
              
              {playersData?.items.length === 0 && searchQuery && (
                <p className="text-center text-muted py-4">No players found</p>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
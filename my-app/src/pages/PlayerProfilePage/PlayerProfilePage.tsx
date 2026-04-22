import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { playerApi } from '@entities/player/api/playerApi';
import { OverviewCard } from '@widgets/stats/OverviewCard/OverviewCard';
import { DecisionIqCard } from '@widgets/stats/DecisionIqCard/DecisionIqCard';
import { RolePositionCard } from '@widgets/stats/RolePositionCard/RolePositionCard';
import { CombatCard } from '@widgets/stats/CombatCard/CombatCard';
import { CompatibilityCard } from '@widgets/stats/CompatibilityCard/CompatibilityCard';
import { clsx } from 'clsx';

type TabType = 'overview' | 'stats' | 'demo';

export const PlayerProfilePage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const { data: playerData, isLoading: playerLoading } = useQuery({
    queryKey: ['player', playerId],
    queryFn: () => playerApi.getPlayerById(playerId!),
    enabled: !!playerId,
  });
  
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['player-stats', playerId],
    queryFn: () => playerApi.getPlayerStats(playerId!),
    enabled: !!playerId,
  });
  
  if (playerLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text">Loading player...</div>
      </div>
    );
  }
  
  const player = playerData?.player;
  
  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-text text-lg">Player not found</p>
        <Link to="/players" className="text-accent hover:underline mt-4 inline-block">
          Back to players
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/30 to-ct-accent/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-text">
              {player.nickname.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text">{player.nickname}</h1>
            <div className="flex items-center gap-3 mt-1">
              {player.faceitElo && (
                <span className="text-sm text-muted">ELO: {player.faceitElo}</span>
              )}
              {player.primaryRole && (
                <span className="badge badge-info">{player.primaryRole}</span>
              )}
              {player.playstyle && (
                <span className="badge badge-info">{player.playstyle}</span>
              )}
            </div>
          </div>
        </div>
        
        <button className="px-4 py-2 bg-accent text-bg-1 rounded-lg font-medium hover:bg-accent/90 transition-colors">
          Add to CRM
        </button>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-card-border mb-6">
        <div className="flex gap-1">
          {(['overview', 'stats', 'demo'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
                activeTab === tab
                  ? 'text-accent border-accent'
                  : 'text-muted border-transparent hover:text-text'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            {/* Behavioral Profile */}
            <div className="card">
              <h2 className="card-header">Behavioral Profile</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Aggression</span>
                    <span className="text-text">{player.aggression || 0}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className="bg-orange-400 h-1.5 rounded-full"
                      style={{ width: `${player.aggression || 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Teamplay</span>
                    <span className="text-text">{player.teamplay || 0}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className="bg-green-400 h-1.5 rounded-full"
                      style={{ width: `${player.teamplay || 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Stability</span>
                    <span className="text-text">{player.stability || 0}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className="bg-blue-400 h-1.5 rounded-full"
                      style={{ width: `${player.stability || 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Decision IQ</span>
                    <span className="text-text">{player.decisionIq || 0}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className="bg-purple-400 h-1.5 rounded-full"
                      style={{ width: `${player.decisionIq || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {player.profileSummary && (
              <div className="card">
                <h2 className="card-header">Summary</h2>
                <p className="text-sm text-muted leading-relaxed">{player.profileSummary}</p>
              </div>
            )}
          </div>
          
          <div>
            <CompatibilityCard teamId="team-1" playerId={playerId!} />
          </div>
        </div>
      )}
      
      {activeTab === 'stats' && statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OverviewCard data={statsData.overview} />
          <DecisionIqCard data={statsData.decisionIq} />
          <RolePositionCard data={statsData.role} />
          <CombatCard data={statsData.combat} />
          {/* Add more stat cards as needed */}
        </div>
      )}
      
      {activeTab === 'demo' && (
        <div className="card p-0 overflow-hidden">
          <div className="aspect-video bg-black">
            <iframe
              src={`/demo/latest?player=${playerId}`}
              className="w-full h-full"
              title="Demo Viewer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
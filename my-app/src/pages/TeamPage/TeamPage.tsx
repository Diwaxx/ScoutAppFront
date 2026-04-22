import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { teamApi } from '@entities/team/api/teamApi';
import { clsx } from 'clsx';

export const TeamPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  
  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamApi.getTeam(teamId!),
    enabled: !!teamId,
  });
  
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['team-health', teamId],
    queryFn: () => teamApi.getTeamHealth(teamId!),
    enabled: !!teamId,
  });
  
  if (teamLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text">Loading team...</div>
      </div>
    );
  }
  
  const team = teamData?.team;
  
  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-text text-lg">Team not found</p>
        <Link to="/" className="text-accent hover:underline mt-4 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">{team.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            {team.averageElo && (
              <span className="text-sm text-muted">Avg ELO: {team.averageElo}</span>
            )}
            {team.style && (
              <span className="badge badge-info">{team.style}</span>
            )}
          </div>
        </div>
        
        <Link
          to={`/teams/${teamId}/candidates`}
          className="px-4 py-2 bg-accent text-bg-1 rounded-lg font-medium hover:bg-accent/90 transition-colors"
        >
          View Candidates
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roster */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="card-header">Roster</h2>
            <div className="space-y-2">
              {team.members.map((member) => (
                <Link
                  key={member.playerId}
                  to={`/players/${member.playerId}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-accent font-medium">
                        {member.nickname.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-text font-medium">{member.nickname}</span>
                  </div>
                  {member.role && (
                    <span className="text-sm text-muted">{member.role}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* Team Health */}
        <div>
          {healthData && (
            <div className="card">
              <h2 className="card-header">Team Health</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Aggression Level</span>
                    <span className="text-text">{healthData.aggressionLevel}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-orange-400 h-2 rounded-full"
                      style={{ width: `${healthData.aggressionLevel}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Stability Level</span>
                    <span className="text-text">{healthData.stabilityLevel}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full"
                      style={{ width: `${healthData.stabilityLevel}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Teamwork Level</span>
                    <span className="text-text">{healthData.teamworkLevel}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-green-400 h-2 rounded-full"
                      style={{ width: `${healthData.teamworkLevel}%` }}
                    />
                  </div>
                </div>
                
                <div className="pt-3 border-t border-card-border">
                  <div className="text-xs font-medium text-muted mb-2">Role Balance</div>
                  <div className="space-y-1">
                    {healthData.roleBalance.map((role) => (
                      <div key={role.role} className="flex items-center justify-between text-sm">
                        <span className="text-text capitalize">{role.role}</span>
                        <span className={clsx(
                          role.filled ? 'text-green-400' : 'text-red-400'
                        )}>
                          {role.filled ? '✓' : '✗'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {healthData.warnings.length > 0 && (
                  <div className="pt-3 border-t border-card-border">
                    <div className="text-xs font-medium text-yellow-400 mb-2">Warnings</div>
                    <ul className="space-y-1">
                      {healthData.warnings.map((warning, i) => (
                        <li key={i} className="text-xs text-muted">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {healthData.recommendations.length > 0 && (
                  <div className="pt-3 border-t border-card-border">
                    <div className="text-xs font-medium text-green-400 mb-2">Recommendations</div>
                    <ul className="space-y-1">
                      {healthData.recommendations.map((rec, i) => (
                        <li key={i} className="text-xs text-muted">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
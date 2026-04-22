import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { teamApi } from '@entities/team/api/teamApi';
import { playerApi } from '@entities/player/api/playerApi';

export const DashboardPage: React.FC = () => {
  const teamId = 'team-1'; // TODO: Get from context/user
  
  const { data: teamData } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamApi.getTeam(teamId),
  });
  
  const { data: healthData } = useQuery({
    queryKey: ['team-health', teamId],
    queryFn: () => teamApi.getTeamHealth(teamId),
  });
  
  const { data: recentPlayers } = useQuery({
    queryKey: ['players', 'recent'],
    queryFn: () => playerApi.getPlayers({ limit: 5, sortBy: 'recent' }),
  });
  
  const team = teamData?.team;
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Welcome back, {team?.name || 'Team'}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Summary */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-header !mb-0">Team Overview</h2>
              <Link
                to={`/teams/${teamId}`}
                className="text-xs text-accent hover:underline"
              >
                View team
              </Link>
            </div>
            
            {team && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted mb-2">Roster</div>
                  <div className="space-y-2">
                    {team.members.slice(0, 5).map((member) => (
                      <Link
                        key={member.playerId}
                        to={`/players/${member.playerId}`}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                          <span className="text-accent text-xs font-medium">
                            {member.nickname.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-text">{member.nickname}</span>
                        {member.role && (
                          <span className="text-xs text-muted ml-auto">{member.role}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted mb-2">Team Style</div>
                  <div className="space-y-3">
                    <div>
                      <span className="badge badge-info">{team.style || 'Balanced'}</span>
                    </div>
                    {team.averageElo && (
                      <div className="stat-row">
                        <span className="stat-label">Average ELO</span>
                        <span className="stat-value">{team.averageElo}</span>
                      </div>
                    )}
                    {team.needs && team.needs.length > 0 && (
                      <div>
                        <div className="text-xs text-muted mb-1">Looking for</div>
                        <div className="flex flex-wrap gap-1">
                          {team.needs.map((need) => (
                            <span key={need} className="badge badge-warning text-xs">
                              {need}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Link
              to={`/teams/${teamId}/candidates`}
              className="card hover:border-accent/50 transition-colors group"
            >
              <div className="text-lg mb-1">🔍 Scout Players</div>
              <p className="text-xs text-muted group-hover:text-text/70">
                Find candidates that fit your team
              </p>
            </Link>
            
            <Link
              to="/players"
              className="card hover:border-accent/50 transition-colors group"
            >
              <div className="text-lg mb-1">📊 Browse Players</div>
              <p className="text-xs text-muted group-hover:text-text/70">
                Explore player profiles and stats
              </p>
            </Link>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-4">
          {/* Team Health Summary */}
          {healthData && (
            <div className="card">
              <h2 className="card-header">Team Health</h2>
              
              {healthData.warnings.length > 0 && (
                <div className="mb-4">
                  {healthData.warnings.slice(0, 2).map((warning, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-yellow-400 mb-2">
                      <span>⚠️</span>
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {healthData.recommendations.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-green-400 mb-2">Recommendations</div>
                  <ul className="space-y-1">
                    {healthData.recommendations.slice(0, 2).map((rec, i) => (
                      <li key={i} className="text-xs text-muted">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Link
                to={`/teams/${teamId}`}
                className="block text-center text-xs text-accent hover:underline mt-4 pt-3 border-t border-card-border"
              >
                View full health report
              </Link>
            </div>
          )}
          
          {/* Recent Candidates */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="card-header !mb-0">Recent Candidates</h2>
              <Link
                to={`/teams/${teamId}/candidates`}
                className="text-xs text-accent hover:underline"
              >
                View all
              </Link>
            </div>
            
            {recentPlayers?.items.length ? (
              <div className="space-y-2">
                {recentPlayers.items.slice(0, 3).map((player) => (
                  <Link
                    key={player.id}
                    to={`/players/${player.id}`}
                    className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text">{player.nickname}</span>
                      {player.primaryRole && (
                        <span className="text-xs text-muted">{player.primaryRole}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {player.faceitElo && (
                        <span className="text-xs text-muted">ELO: {player.faceitElo}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-4">No recent candidates</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
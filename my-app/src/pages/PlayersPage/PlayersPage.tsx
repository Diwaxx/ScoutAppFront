import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { playerApi } from '@entities/player/api/playerApi';
import type { PlayerRole, Playstyle } from '@shared/types';

const roleOptions: { value: PlayerRole | ''; label: string }[] = [
  { value: '', label: 'All Roles' },
  { value: 'entry', label: 'Entry' },
  { value: 'support', label: 'Support' },
  { value: 'igl', label: 'IGL' },
  { value: 'lurker', label: 'Lurker' },
  { value: 'awper', label: 'AWPer' },
  { value: 'anchor', label: 'Anchor' },
  { value: 'rifler', label: 'Rifler' },
];

const playstyleOptions: { value: Playstyle | ''; label: string }[] = [
  { value: '', label: 'All Styles' },
  { value: 'aggressive', label: 'Aggressive' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'passive', label: 'Passive' },
];

const sortOptions: { value: string; label: string }[] = [
  { value: 'elo_desc', label: 'ELO (High to Low)' },
  { value: 'elo_asc', label: 'ELO (Low to High)' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'compatibility', label: 'Compatibility' },
];

export const PlayersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<PlayerRole | ''>('');
  const [playstyle, setPlaystyle] = useState<Playstyle | ''>('');
  const [sortBy, setSortBy] = useState('elo_desc');
  const [minElo, setMinElo] = useState('');
  const [maxElo, setMaxElo] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['players', { search, role, playstyle, sortBy, minElo, maxElo }],
    queryFn: () => playerApi.getPlayers({
      search: search || undefined,
      role: role || undefined,
      playstyle: playstyle || undefined,
      sortBy,
      minElo: minElo ? Number(minElo) : undefined,
      maxElo: maxElo ? Number(maxElo) : undefined,
      limit: 50,
    }),
  });
  
  const players = data?.items || [];
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-text mb-6">Players</h1>
      
      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1">Search</label>
            <input
              type="text"
              placeholder="Player name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-card-border rounded-lg text-text placeholder-muted text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-muted mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as PlayerRole | '')}
              className="w-full px-3 py-2 bg-white/5 border border-card-border rounded-lg text-text text-sm"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-muted mb-1">Playstyle</label>
            <select
              value={playstyle}
              onChange={(e) => setPlaystyle(e.target.value as Playstyle | '')}
              className="w-full px-3 py-2 bg-white/5 border border-card-border rounded-lg text-text text-sm"
            >
              {playstyleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-muted mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-card-border rounded-lg text-text text-sm"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-muted mb-1">Min ELO</label>
            <input
              type="number"
              placeholder="Min"
              value={minElo}
              onChange={(e) => setMinElo(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-card-border rounded-lg text-text placeholder-muted text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-muted mb-1">Max ELO</label>
            <input
              type="number"
              placeholder="Max"
              value={maxElo}
              onChange={(e) => setMaxElo(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-card-border rounded-lg text-text placeholder-muted text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-text">Loading players...</div>
        </div>
      ) : (
        <>
          <div className="text-xs text-muted mb-3">
            {data?.total || 0} players found
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <Link
                key={player.id}
                to={`/players/${player.id}`}
                className="card hover:border-accent/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-ct-accent/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-text">
                      {player.nickname.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text group-hover:text-accent transition-colors truncate">
                      {player.nickname}
                    </h3>
                    
                    <div className="flex flex-wrap gap-1 mt-1">
                      {player.primaryRole && (
                        <span className="badge badge-info text-xs">{player.primaryRole}</span>
                      )}
                      {player.playstyle && (
                        <span className="badge badge-info text-xs">{player.playstyle}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2">
                      {player.faceitElo && (
                        <span className="text-xs text-muted">ELO: {player.faceitElo}</span>
                      )}
                    </div>
                    
                    {/* Mini metrics */}
                    <div className="grid grid-cols-3 gap-1 mt-3 pt-3 border-t border-card-border">
                      <div>
                        <div className="text-[10px] text-muted">Aggression</div>
                        <div className="text-xs font-medium text-text">{player.aggression || 0}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted">Teamplay</div>
                        <div className="text-xs font-medium text-text">{player.teamplay || 0}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted">Decision IQ</div>
                        <div className="text-xs font-medium text-text">{player.decisionIq || 0}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {players.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text text-lg mb-2">No players found</p>
              <p className="text-sm text-muted">Try adjusting your filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
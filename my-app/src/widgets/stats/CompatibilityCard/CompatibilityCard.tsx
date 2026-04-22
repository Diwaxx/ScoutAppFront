import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { compatibilityApi } from '@entities/compatibility/api/compatibilityApi';
import type { CompatibilityResponse } from '@shared/types';
import { clsx } from 'clsx';

interface CompatibilityCardProps {
  teamId: string;
  playerId: string;
}

const verdictConfig: Record<CompatibilityResponse['verdict'], { label: string; color: string }> = {
  strong_fit: { label: 'Strong Fit', color: 'text-green-400 bg-green-500/20 border-green-500/30' },
  good_fit: { label: 'Good Fit', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
  risky_fit: { label: 'Risky Fit', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' },
  poor_fit: { label: 'Poor Fit', color: 'text-red-400 bg-red-500/20 border-red-500/30' },
};

export const CompatibilityCard: React.FC<CompatibilityCardProps> = ({ teamId, playerId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['compatibility', teamId, playerId],
    queryFn: () => compatibilityApi.getCompatibility(teamId, playerId),
    enabled: !!teamId && !!playerId,
  });
  
  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded mb-4" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-4 w-3/4 bg-white/10 rounded" />
        </div>
      </div>
    );
  }
  
  if (!data) return null;
  
  const verdictStyle = verdictConfig[data.verdict];
  
  return (
    <div className="card">
      <h2 className="card-header">Compatibility</h2>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-text">{data.score}</span>
          <span className="text-sm text-muted">/100</span>
        </div>
        <span className={clsx('px-3 py-1 rounded-full text-sm font-medium border', verdictStyle.color)}>
          {verdictStyle.label}
        </span>
      </div>
      
      <div className="space-y-3 mb-4">
        {Object.entries(data.breakdown).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted capitalize">{key.replace('Fit', ' Fit')}</span>
              <span className="text-text">{value}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-accent h-1.5 rounded-full transition-all"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {data.pros.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium text-green-400 mb-1">Pros</div>
          <ul className="space-y-1">
            {data.pros.slice(0, 3).map((pro, i) => (
              <li key={i} className="text-sm text-text flex items-start gap-2">
                <span className="text-green-400 mt-1">+</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {data.cons.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium text-red-400 mb-1">Cons</div>
          <ul className="space-y-1">
            {data.cons.slice(0, 3).map((con, i) => (
              <li key={i} className="text-sm text-text flex items-start gap-2">
                <span className="text-red-400 mt-1">-</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {data.warnings && data.warnings.length > 0 && (
        <div>
          <div className="text-xs font-medium text-yellow-400 mb-1">Warnings</div>
          <ul className="space-y-1">
            {data.warnings.map((warning, i) => (
              <li key={i} className="text-xs text-muted flex items-start gap-2">
                <span className="text-yellow-400">!</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
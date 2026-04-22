import React from 'react';
import type { PlayerStats } from '@shared/types';

interface OverviewCardProps {
  data: PlayerStats['overview'];
}

export const OverviewCard: React.FC<OverviewCardProps> = ({ data }) => {
  return (
    <div className="card">
      <h2 className="card-header">Overview</h2>
      <div className="space-y-1">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="stat-row">
            <span className="stat-label">{key}</span>
            <span className="stat-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
import React from 'react';
import type { CombatStats } from '@shared/types';

interface CombatCardProps {
  data: CombatStats;
}

export const CombatCard: React.FC<CombatCardProps> = ({ data }) => {
  return (
    <div className="card">
      <h2 className="card-header">Combat</h2>
      <div className="space-y-1">
        <div className="stat-row">
          <span className="stat-label">Kills</span>
          <span className="stat-value">{data.kills}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Deaths</span>
          <span className="stat-value">{data.deaths}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Assists</span>
          <span className="stat-value">{data.assists}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">K/D</span>
          <span className="stat-value">{data.kd.toFixed(2)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">K/R</span>
          <span className="stat-value">{data.kr.toFixed(2)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Headshots</span>
          <span className="stat-value">{data.hs}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">HS%</span>
          <span className="stat-value">{data.hsPercent}%</span>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import type { RoleProfile } from '@shared/types';

interface RolePositionCardProps {
  data: RoleProfile;
  sideRounds?: { t: number; ct: number };
}

export const RolePositionCard: React.FC<RolePositionCardProps> = ({ data, sideRounds }) => {
  return (
    <div className="card">
      <h2 className="card-header">Role & Position</h2>
      <div className="space-y-1">
        <div className="stat-row">
          <span className="stat-label">Primary Role</span>
          <span className="stat-value">{data.primary.role}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Primary Strength</span>
          <span className="stat-value">{Math.round(data.primary.score)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Secondary Role</span>
          <span className="stat-value">{data.secondary.role}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Role Confidence</span>
          <span className="stat-value">{Math.round(data.confidence)}</span>
        </div>
        
        {sideRounds && (
          <>
            <div className="stat-row">
              <span className="stat-label">T Rounds</span>
              <span className="stat-value text-t-accent">{sideRounds.t}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">CT Rounds</span>
              <span className="stat-value text-ct-accent">{sideRounds.ct}</span>
            </div>
          </>
        )}
        
        {data.topZones.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-muted mb-1">Top Zones</div>
            {data.topZones.map((zone, i) => (
              <div key={i} className="stat-row">
                <span className="stat-label">{zone.zone}</span>
                <span className="stat-value">{zone.pct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
import React from 'react';
import type { DecisionIQ } from '@shared/types';

interface DecisionIqCardProps {
  data: DecisionIQ;
}

const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'S': return 'text-yellow-400';
    case 'A': return 'text-green-400';
    case 'B': return 'text-blue-400';
    case 'C': return 'text-orange-400';
    default: return 'text-red-400';
  }
};

export const DecisionIqCard: React.FC<DecisionIqCardProps> = ({ data }) => {
  return (
    <div className="card">
      <h2 className="card-header">Decision IQ</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-text">{Math.round(data.total)}</span>
          <span className={`text-xl font-bold ${getGradeColor(data.grade)}`}>{data.grade}</span>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all"
            style={{ width: `${data.total}%` }}
          />
        </div>
        
        <div className="space-y-1 mt-3">
          <div className="stat-row">
            <span className="stat-label">Entry Score</span>
            <span className="stat-value">{Math.round(data.entryScore)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Trade Score</span>
            <span className="stat-value">{Math.round(data.tradeScore)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Clutch Score</span>
            <span className="stat-value">{Math.round(data.clutchScore)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Utility Score</span>
            <span className="stat-value">{Math.round(data.utilityScore)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
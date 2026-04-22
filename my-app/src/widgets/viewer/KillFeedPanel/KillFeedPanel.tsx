import React from 'react';
import { useViewerStore } from '@entities/demo/model/viewerStore';

export const KillFeedPanel: React.FC = () => {
  const killsByTick = useViewerStore((s) => s.killsByTick);
  const playbackTick = useViewerStore((s) => s.playbackTick);
  
  // Simple kill feed - get recent kills
  const recentKills = React.useMemo(() => {
    const kills: Array<{ killer: string; victim: string; weapon: string; hs: boolean }> = [];
    const ticks = Array.from(killsByTick.keys()).sort((a, b) => Number(b) - Number(a));
    
    for (const tick of ticks) {
      if (tick > playbackTick) continue;
      if (kills.length >= 8) break;
      
      const events = killsByTick.get(tick) || [];
      for (const ev of events) {
        const data = ev.data || {};
        kills.push({
          killer: String(data.killer_name || 'unknown'),
          victim: String(data.victim_name || 'unknown'),
          weapon: String(data.weapon || '').replace('weapon_', ''),
          hs: Boolean(data.hs),
        });
      }
    }
    
    return kills;
  }, [killsByTick, playbackTick]);
  
  return (
    <details className="ui-panel kill-panel">
      <summary>Kills</summary>
      <div className="panel-body">
        <div className="kill-feed">
          {recentKills.length === 0 ? (
            <div className="text-sm text-muted">no kills yet</div>
          ) : (
            recentKills.map((kill, i) => (
              <div key={i} className="kill-row">
                <span className="kill-killer">{kill.killer}</span>
                <span className="kill-arrow">→</span>
                <span className="kill-victim">{kill.victim}</span>
                <span className="kill-weapon">{kill.weapon}</span>
                {kill.hs && <span className="kill-hs">HS</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </details>
  );
};
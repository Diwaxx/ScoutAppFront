import React from 'react';
import { useViewerStore } from '@entities/demo/model/viewerStore';

export const EconomyPanel: React.FC = () => {
  const econRounds = useViewerStore((s) => s.econRounds);
  const playbackTick = useViewerStore((s) => s.playbackTick);
  
  // Find current round economy
  const currentEcon = React.useMemo(() => {
    return econRounds.find((r) => r.tick <= playbackTick && 
      (econRounds[econRounds.indexOf(r) + 1]?.tick || Infinity) > playbackTick);
  }, [econRounds, playbackTick]);
  
  if (!currentEcon) {
    return (
      <details className="ui-panel econ-panel">
        <summary>Economy</summary>
        <div className="panel-body">
          <div className="text-sm text-muted">no economy data</div>
        </div>
      </details>
    );
  }
  
  const tData = currentEcon.data.t || { money_total: 0, freeze_value: 0, buy_type: 'unknown' };
  const ctData = currentEcon.data.ct || { money_total: 0, freeze_value: 0, buy_type: 'unknown' };
  
  return (
    <details className="ui-panel econ-panel">
      <summary>Economy</summary>
      <div className="panel-body">
        <div className="econ-now">
          <div className="econ-head">Round {currentEcon.round} economy</div>
          
          <div className="econ-row econ-t">
            <span className="team-tag">T</span>
            <span>${tData.money_total.toLocaleString()} | EQ ${tData.freeze_value.toLocaleString()}</span>
            <span className="text-xs text-muted">{tData.buy_type}</span>
          </div>
          
          <div className="econ-row econ-ct">
            <span className="team-tag">CT</span>
            <span>${ctData.money_total.toLocaleString()} | EQ ${ctData.freeze_value.toLocaleString()}</span>
            <span className="text-xs text-muted">{ctData.buy_type}</span>
          </div>
        </div>
        
        {/* Recent rounds chart */}
        <div className="econ-chart">
          {econRounds.slice(-8).map((r) => {
            const t = r.data.t || { freeze_value: 0 };
            const ct = r.data.ct || { freeze_value: 0 };
            const maxVal = Math.max(22000, t.freeze_value, ct.freeze_value);
            
            return (
              <div key={r.round} className="econ-chart-row">
                <span className="econ-round">R{r.round}</span>
                <div className="econ-bars">
                  <div className="econ-bar-track">
                    <div
                      className="econ-bar-fill t"
                      style={{ width: `${(t.freeze_value / maxVal) * 100}%` }}
                    />
                  </div>
                  <div className="econ-bar-track">
                    <div
                      className="econ-bar-fill ct"
                      style={{ width: `${(ct.freeze_value / maxVal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
};
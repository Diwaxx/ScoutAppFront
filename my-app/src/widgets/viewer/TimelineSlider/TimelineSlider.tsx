import React, { useMemo } from 'react';
import { useViewerStore } from '@entities/demo/model/viewerStore';

export const TimelineSlider: React.FC = () => {
  const playbackTick = useViewerStore((s) => s.playbackTick);
  const ticksSorted = useViewerStore((s) => s.ticksSorted);
  const roundStartTicks = useViewerStore((s) => s.roundStartTicks);
  const setPlaybackTick = useViewerStore((s) => s.setPlaybackTick);
  
  const minTick = ticksSorted[0] || 0;
  const maxTick = ticksSorted[ticksSorted.length - 1] || 0;
  
  const roundMarkers = useMemo(() => {
    const span = maxTick - minTick;
    if (!Number.isFinite(span) || span <= 0) return [];
    
    return roundStartTicks
      .filter((tick) => tick >= minTick && tick <= maxTick)
      .map((tick, index) => ({
        tick,
        round: index + 1,
        percent: ((tick - minTick) / span) * 100,
      }));
  }, [minTick, maxTick, roundStartTicks]);
  
  return (
    <details className="ui-panel timeline-panel" open>
      <summary>Timeline</summary>
      <div className="panel-body">
        <div className="slider-wrap">
          <input
            type="range"
            min={minTick}
            max={maxTick}
            value={playbackTick}
            step="1"
            onChange={(e) => setPlaybackTick(Number(e.target.value))}
          />
          
          <div className="round-markers">
            {roundMarkers.map(({ tick, round, percent }) => (
              <span
                key={tick}
                className="round-marker"
                style={{ left: `${percent}%` }}
                title={`Round ${round}`}
                onClick={() => setPlaybackTick(tick)}
              />
            ))}
          </div>
        </div>
      </div>
    </details>
  );
};
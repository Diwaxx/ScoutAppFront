import React from 'react';
import { useViewerStore } from '@entities/demo/model/viewerStore';

export const ViewerFilters: React.FC = () => {
  const filters = useViewerStore((s) => s.filters);
  const setFilter = useViewerStore((s) => s.setFilter);
  
  return (
    <details className="ui-panel">
      <summary>Filters</summary>
      <div className="panel-body">
        <div className="toggles-grid">
          <label>
            <input
              type="checkbox"
              checked={filters.showPlayers}
              onChange={(e) => setFilter('showPlayers', e.target.checked)}
            />
            Players
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.showShots}
              onChange={(e) => setFilter('showShots', e.target.checked)}
            />
            Shots
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.showTracers}
              onChange={(e) => setFilter('showTracers', e.target.checked)}
            />
            Tracers
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.showNades}
              onChange={(e) => setFilter('showNades', e.target.checked)}
            />
            Grenades
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.showBomb}
              onChange={(e) => setFilter('showBomb', e.target.checked)}
            />
            Bomb
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.showViewDir}
              onChange={(e) => setFilter('showViewDir', e.target.checked)}
            />
            View dir
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.showTails}
              onChange={(e) => setFilter('showTails', e.target.checked)}
            />
            Tails
          </label>
        </div>
        
        <label className="tail-row">
          <span>Tail len</span>
          <input
            type="range"
            min="1"
            max="32"
            value={filters.tailLength}
            onChange={(e) => setFilter('tailLength', Number(e.target.value))}
          />
        </label>
      </div>
    </details>
  );
};
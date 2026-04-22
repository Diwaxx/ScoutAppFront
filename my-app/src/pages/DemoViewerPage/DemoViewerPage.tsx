import React, { useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useViewerStore } from '@entities/demo/model/viewerStore';
import { RadarCanvas } from '@widgets/viewer/RadarCanvas/RadarCanvas';
import { PlaybackControls } from '@widgets/viewer/PlaybackControls/PlaybackControls';
import { TimelineSlider } from '@widgets/viewer/TimelineSlider/TimelineSlider';
import { KillFeedPanel } from '@widgets/viewer/KillFeedPanel/KillFeedPanel';
import { EconomyPanel } from '@widgets/viewer/EconomyPanel/EconomyPanel';
import { ViewerFilters } from '@features/viewer-filters/ViewerFilters';
import { useDataLoader } from './hooks/useDataLoader';
import './DemoViewerPage.css';

export const DemoViewerPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { loadData, isLoading, error } = useDataLoader();
  
  const isLoaded = useViewerStore((s) => s.isLoaded);
  const mapName = useViewerStore((s) => s.mapName);
  const playbackTick = useViewerStore((s) => s.playbackTick);
  const status = useViewerStore((s) => s.status);
  
  useEffect(() => {
    if (matchId) {
      loadData(matchId);
    }
  }, [matchId, loadData]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-bg-1 to-bg-2">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text font-exo">{status}</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-bg-1 to-bg-2">
        <div className="text-center text-red-400">
          <p className="text-xl mb-4">Error loading demo</p>
          <p className="text-sm">{error}</p>
          <Link to="/" className="mt-4 inline-block text-accent hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="viewer-root">
      <div className="canvas-wrap">
        <RadarCanvas />
        
        <div className="overlay-dock left-dock">
          <div className="brand-badge">
            <strong>CS2 Demo Viewer</strong>
            <span>{mapName || 'Loading...'}</span>
          </div>
          
          <PlaybackControls />
          <ViewerFilters />
        </div>
        
        <div className="overlay-dock right-dock">
          <TimelineSlider />
          <KillFeedPanel />
          <EconomyPanel />
          
          <details className="ui-panel">
            <summary>Navigation</summary>
            <div className="panel-body">
              <span className="block text-sm text-muted">Wheel: zoom</span>
              <span className="block text-sm text-muted">RMB/MMB drag: pan</span>
              <span className="block text-sm text-muted">Double click: reset view</span>
            </div>
          </details>
        </div>
        
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted bg-card/80 px-3 py-1 rounded-full backdrop-blur-panel">
          Tick: {playbackTick.toFixed(1)} | {status}
        </div>
      </div>
    </div>
  );
};
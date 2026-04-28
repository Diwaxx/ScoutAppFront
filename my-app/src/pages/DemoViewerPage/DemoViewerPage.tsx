import React, { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useViewerStore } from "@entities/demo/model/viewerStore";
import { RadarCanvas } from "@widgets/viewer/RadarCanvas/RadarCanvas";
import { PlaybackControls } from "@widgets/viewer/PlaybackControls/PlaybackControls";
import { TimelineSlider } from "@widgets/viewer/TimelineSlider/TimelineSlider";
import { KillFeedPanel } from "@widgets/viewer/KillFeedPanel/KillFeedPanel";
import { EconomyPanel } from "@widgets/viewer/EconomyPanel/EconomyPanel";
import { ViewerFilters } from "@features/viewer-filters/ViewerFilters";
import { useDataLoader } from "./hooks/useDataLoader";
import { usePlaybackLoop } from './hooks/usePlaybackLoop';
import "./DemoViewerPage.css";

export const DemoViewerPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { loadData, isLoading, error, progress } = useDataLoader();

  usePlaybackLoop();

  useEffect(() => {
    document.documentElement.classList.add("viewer-page-lock");
    document.body.classList.add("viewer-page-lock");

    return () => {
      document.documentElement.classList.remove("viewer-page-lock");
      document.body.classList.remove("viewer-page-lock");
    };
  }, []);
  const requestedMatchRef = useRef<string | null>(null);

  const isLoaded = useViewerStore((s) => s.isLoaded);
  const mapName = useViewerStore((s) => s.mapName);
  const playbackTick = useViewerStore((s) => s.playbackTick);
  const status = useViewerStore((s) => s.status);

  useEffect(() => {
    if (!matchId) return;
    if (requestedMatchRef.current === matchId) return;

    requestedMatchRef.current = matchId;
    void loadData(matchId);
  }, [matchId, loadData]);

  if (!matchId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-bg-1 to-bg-2">
        <div className="text-center text-red-400">
          <p className="text-xl mb-4">Match ID not found</p>
          <Link to="/" className="text-accent hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-bg-1 to-bg-2 px-6">
        <div className="text-center text-red-400 max-w-2xl">
          <p className="text-xl mb-4">Error loading demo</p>
          <p className="text-sm whitespace-pre-wrap break-words">{error}</p>
          <Link
            to="/"
            className="mt-4 inline-block text-accent hover:underline"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-bg-1 to-bg-2">
        <div className="text-center w-[320px] max-w-[90vw]">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text font-exo mb-3">
            {status || "Loading demo..."}
          </p>

          <div className="w-full h-2 bg-card rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-accent transition-all duration-200"
              style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
            />
          </div>

          <p className="text-sm text-muted">{progress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="viewer-root">
      {/* Left panel */}
      <div className="side-dock left-dock">
        <div className="brand-badge">
          <strong>CS2 Demo Viewer</strong>
          <span>{mapName || "Unknown map"}</span>
        </div>
        <PlaybackControls />
        <ViewerFilters />
      </div>

      {/* Radar */}
      <div className="canvas-wrap">
        <RadarCanvas />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted bg-card/80 px-3 py-1 rounded-full backdrop-blur-panel">
          Tick:{" "}
          {Number.isFinite(playbackTick) ? playbackTick.toFixed(1) : "0.0"}{" "}
          | {status}
        </div>
      </div>

      {/* Right panel */}
      <div className="side-dock right-dock">
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
    </div>
  );
};

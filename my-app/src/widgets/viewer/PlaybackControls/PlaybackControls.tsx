import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useViewerStore } from '@entities/demo/model/viewerStore';

const ASSUMED_TICKRATE = 64;

export const PlaybackControls: React.FC = () => {
  const mapName = useViewerStore((s) => s.mapName);
  const playbackTick = useViewerStore((s) => s.playbackTick);
  const playbackSpeed = useViewerStore((s) => s.playbackSpeed);
  const playing = useViewerStore((s) => s.playing);
  const status = useViewerStore((s) => s.status);
  const ticksSorted = useViewerStore((s) => s.ticksSorted);

  const setPlaybackSpeed = useViewerStore((s) => s.setPlaybackSpeed);
  const setPlaybackTick = useViewerStore((s) => s.setPlaybackTick);
  const setPlaying = useViewerStore((s) => s.setPlaying);
  const setViewState = useViewerStore((s) => s.setViewState);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  const minTick = ticksSorted[0] || 0;
  const maxTick = ticksSorted[ticksSorted.length - 1] || 0;

  useEffect(() => {
    if (!playing) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTsRef.current = null;
      return;
    }

    const animate = (now: number) => {
      if (lastTsRef.current == null) {
        lastTsRef.current = now;
      }

      const dtSec = Math.max(0, (now - lastTsRef.current) / 1000);
      lastTsRef.current = now;

      const nextTick = playbackTick + dtSec * ASSUMED_TICKRATE * Math.max(0.1, playbackSpeed || 1);

      if (nextTick >= maxTick) {
        setPlaybackTick(maxTick);
        setPlaying(false);
        return;
      }

      if (nextTick < minTick) {
        setPlaybackTick(minTick);
      } else {
        setPlaybackTick(nextTick);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTsRef.current = null;
    };
  }, [playing, playbackTick, playbackSpeed, minTick, maxTick, setPlaybackTick, setPlaying]);

  const togglePlayPause = () => {
    if (!ticksSorted.length) return;
    if (playbackTick >= maxTick) {
      setPlaybackTick(minTick);
    }
    setPlaying(!playing);
  };

  const handleFocusReset = () => {
    setViewState({ zoom: 1, panX: 0, panY: 0 });
  };

  return (
    <details className="ui-panel playback-panel" open>
      <summary>Playback</summary>
      <div className="panel-body">
        <div className="chips">
          <span className="pill">map: {mapName || '...'}</span>
          <span className="pill">tick: {playbackTick.toFixed(1)}</span>
        </div>

        <div className="play-controls">
          <button onClick={togglePlayPause}>
            {playing ? '|| pause' : '> play'}
          </button>

          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          >
            <option value="0.25">x0.25</option>
            <option value="0.5">x0.5</option>
            <option value="1">x1</option>
            <option value="2">x2</option>
            <option value="4">x4</option>
            <option value="8">x8</option>
          </select>

          <Link to="/players" className="mini-btn">stats</Link>
          <button onClick={handleFocusReset}>focus</button>
        </div>

        <span className="small">{status}</span>
      </div>
    </details>
  );
};
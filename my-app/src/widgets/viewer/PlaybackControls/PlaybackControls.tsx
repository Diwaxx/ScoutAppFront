import React from 'react';
import { Link } from 'react-router-dom';
import { useViewerStore } from '@entities/demo/model/viewerStore';

interface PlaybackControlsProps {
  onToggleFocus?: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({ onToggleFocus }) => {
  const mapName = useViewerStore((s) => s.mapName);
  const playbackTick = useViewerStore((s) => s.playbackTick);
  const playbackSpeed = useViewerStore((s) => s.playbackSpeed);
  const playing = useViewerStore((s) => s.playing);
  const status = useViewerStore((s) => s.status);
  const ticksSorted = useViewerStore((s) => s.ticksSorted);

  const setPlaybackSpeed = useViewerStore((s) => s.setPlaybackSpeed);
  const setPlaybackTick = useViewerStore((s) => s.setPlaybackTick);
  const setPlaying = useViewerStore((s) => s.setPlaying);

  const minTick = ticksSorted[0] || 0;
  const maxTick = ticksSorted[ticksSorted.length - 1] || 0;

  const togglePlayPause = () => {
    if (!ticksSorted.length) return;

    if (playbackTick >= maxTick) {
      setPlaybackTick(minTick);
    }

    setPlaying(!playing);
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
          <button type="button" onClick={togglePlayPause}>
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

          <Link to="/players" className="mini-btn">
            stats
          </Link>

          <button type="button" onClick={() => onToggleFocus?.()}>
            focus
          </button>
        </div>

        <span className="small">{status}</span>
      </div>
    </details>
  );
};
import React from 'react';
import { Link } from 'react-router-dom';
import { useViewerStore } from '@entities/demo/model/viewerStore';

export const PlaybackControls: React.FC = () => {
  const mapName = useViewerStore((s) => s.mapName);
  const playbackTick = useViewerStore((s) => s.playbackTick);
  const playbackSpeed = useViewerStore((s) => s.playbackSpeed);
  const playing = useViewerStore((s) => s.playing);
  const status = useViewerStore((s) => s.status);
  const setPlaybackSpeed = useViewerStore((s) => s.setPlaybackSpeed);
  const setPlaying = useViewerStore((s) => s.setPlaying);
  const setViewState = useViewerStore((s) => s.setViewState);
  
  const togglePlayPause = () => setPlaying(!playing);
  
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
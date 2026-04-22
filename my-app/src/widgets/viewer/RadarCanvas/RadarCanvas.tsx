import React, { useRef, useEffect } from 'react';
import { useViewerStore } from '@entities/demo/model/viewerStore';

interface RadarCanvasProps {
  width?: number;
  height?: number;
}

export const RadarCanvas: React.FC<RadarCanvasProps> = ({ width = 1024, height = 1024 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const radarImg = useViewerStore((s) => s.radarImg);
  const playbackTick = useViewerStore((s) => s.playbackTick);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !radarImg) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = radarImg.naturalWidth;
    canvas.height = radarImg.naturalHeight;
    
    // Clear and draw radar image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(radarImg, 0, 0);
    
    // TODO: Add full rendering logic from render.js
  }, [radarImg, playbackTick]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};
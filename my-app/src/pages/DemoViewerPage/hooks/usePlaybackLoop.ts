import { useEffect, useRef } from 'react';
import { useViewerStore } from '@entities/demo/model/viewerStore';

const ASSUMED_TICKRATE = 64;

export function usePlaybackLoop() {
  const playing = useViewerStore((s) => s.playing);
  const ticksSorted = useViewerStore((s) => s.ticksSorted);

  const setPlaybackTick = useViewerStore((s) => s.setPlaybackTick);
  const setPlaying = useViewerStore((s) => s.setPlaying);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  const minTick = ticksSorted[0] || 0;
  const maxTick = ticksSorted[ticksSorted.length - 1] || 0;

  useEffect(() => {
    if (!playing || !ticksSorted.length) {
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

      const state = useViewerStore.getState();
      const currentTick = state.playbackTick;
      const speed = state.playbackSpeed || 1;

      const nextTick =
        currentTick + dtSec * ASSUMED_TICKRATE * Math.max(0.1, speed);

      if (nextTick >= maxTick) {
        setPlaybackTick(maxTick);
        setPlaying(false);
        return;
      }

      setPlaybackTick(Math.max(minTick, nextTick));
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
  }, [playing, ticksSorted.length, minTick, maxTick, setPlaybackTick, setPlaying]);
}
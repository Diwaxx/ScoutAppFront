import { useCallback, useState } from 'react';
import { useViewerStore } from '@entities/demo/model/viewerStore';
import { demoApi } from '@entities/demo/api/demoApi';
import { parseRadarTxt } from '@features/viewer/lib/radar';
import { loadEventsData, rebuildIndexes } from '@features/viewer/lib/dataLoader';

export function useDataLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const store = useViewerStore();
  
  const loadData = useCallback(async (matchId: string) => {
    setIsLoading(true);
    setError(null);
    store.reset();
    
    try {
      store.setStatus('loading meta.json...');
      
      // Load meta
      const metaRes = await fetch('/out/meta.json');
      const meta = await metaRes.json();
      const map = meta.map || 'unknown';
      store.setMapName(map);
      
      // Load radar
      store.setStatus('loading radar data...');
      const [radarImg, radarTxt] = await Promise.all([
        demoApi.getRadarImage(map),
        demoApi.getRadarTxt(map),
      ]);
      
      const tr = parseRadarTxt(radarTxt);
      store.setRadarTransform(tr);
      store.setRadarImage(radarImg);
      
      // Load events
      store.setStatus('loading events.jsonl...');
      const eventsRes = await fetch('/out/events.jsonl');
      const eventsText = await eventsRes.text();
      
      const eventMaps = await loadEventsData(eventsText);
      const indexes = rebuildIndexes(eventMaps);
      
      store.setEventMaps({
        ...eventMaps,
        ...indexes,
      });
      
      const minTick = indexes.ticksSorted[0] || 0;
      store.setPlaybackTick(minTick);
      store.setStatus(`ready: ${indexes.ticksSorted.length} event ticks`);
      store.setIsLoaded(true);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      store.setStatus(`ERROR: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [store]);
  
  return { loadData, isLoading, error };
}
import { useCallback, useRef, useState } from 'react';
import { useViewerStore } from '@entities/demo/model/viewerStore';
import { parseRadarTxt } from '@features/viewer/lib/radar';
import defaultRadarPng from '@/assets/radar/default.png';

interface EventMaps {
  posByTick: Map<number, any[]>;
  shotsByTick: Map<number, any[]>;
  tracersByTick: Map<number, any[]>;
  nadesByTick: Map<number, any[]>;
  bombByTick: Map<number, any[]>;
  inventoryByTick: Map<number, any[]>;
  flashByTick: Map<number, any[]>;
  killsByTick: Map<number, any[]>;
  econByTick: Map<number, any[]>;
  roundByTick: Map<number, number>;
  scoreByTick: Map<number, any>;
  roundStartTicks: number[];
  econRounds: any[];
}

interface Indexes {
  ticksSorted: number[];
  posTicksSorted: number[];
  shotTicksSorted: number[];
  inventoryTicksSorted: number[];
  flashTicksSorted: number[];
  killTicksSorted: number[];
  econTicksSorted: number[];
}

interface MetaJson {
  map?: string;
  [key: string]: any;
}

let cachedMatchId: string | null = null;
let cachedEventMaps: EventMaps | null = null;
let cachedIndexes: Indexes | null = null;
let cachedMeta: MetaJson | null = null;

function createEmptyEventMaps(): EventMaps {
  return {
    posByTick: new Map(),
    shotsByTick: new Map(),
    tracersByTick: new Map(),
    nadesByTick: new Map(),
    bombByTick: new Map(),
    inventoryByTick: new Map(),
    flashByTick: new Map(),
    killsByTick: new Map(),
    econByTick: new Map(),
    roundByTick: new Map(),
    scoreByTick: new Map(),
    roundStartTicks: [],
    econRounds: [],
  };
}

function pushByTick(map: Map<number, any[]>, tick: number, ev: any) {
  if (!Number.isFinite(tick)) return;
  const prev = map.get(tick);
  if (prev) prev.push(ev);
  else map.set(tick, [ev]);
}

function isKnifeWeapon(rawWeapon: unknown) {
  const weapon = String(rawWeapon || '').toLowerCase();
  if (!weapon) return false;
  return (
    weapon.includes('knife') ||
    weapon.includes('bayonet') ||
    weapon.includes('dagger')
  );
}

function rebuildIndexes(maps: EventMaps): Indexes {
  const sortNumeric = (a: number, b: number) => a - b;

  const allTicks = new Set<number>();
  const mapsToScan = [
    maps.posByTick,
    maps.shotsByTick,
    maps.tracersByTick,
    maps.nadesByTick,
    maps.bombByTick,
    maps.inventoryByTick,
    maps.flashByTick,
    maps.killsByTick,
    maps.econByTick,
    maps.roundByTick,
    maps.scoreByTick,
  ];

  for (const map of mapsToScan) {
    for (const key of map.keys()) {
      allTicks.add(key);
    }
  }

  return {
    ticksSorted: Array.from(allTicks).sort(sortNumeric),
    posTicksSorted: Array.from(maps.posByTick.keys()).sort(sortNumeric),
    shotTicksSorted: Array.from(maps.shotsByTick.keys()).sort(sortNumeric),
    inventoryTicksSorted: Array.from(maps.inventoryByTick.keys()).sort(sortNumeric),
    flashTicksSorted: Array.from(maps.flashByTick.keys()).sort(sortNumeric),
    killTicksSorted: Array.from(maps.killsByTick.keys()).sort(sortNumeric),
    econTicksSorted: Array.from(maps.econByTick.keys()).sort(sortNumeric),
  };
}

async function loadJSON<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: 'no-cache' });

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: HTTP ${response.status}`);
  }

  return await response.json();
}

async function loadImage(path: string, fallback?: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => {
      if (!fallback) {
        reject(new Error(`Failed to load image: ${path}`));
        return;
      }

      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = () => reject(new Error(`Failed to load image: ${path}`));
      fallbackImg.src = fallback;
    };

    img.src = path;
  });
}

const radarTxtModules = import.meta.glob('/src/assets/radar/*.txt', {
  query: '?raw',
  import: 'default',
});

const radarPngModules = import.meta.glob('/src/assets/radar/*.png', {
  import: 'default',
});

async function loadRadarTransform(mapName: string) {
  const key = `/src/assets/radar/${mapName}.txt`;
  const loader = radarTxtModules[key] as (() => Promise<string>) | undefined;

  if (!loader) {
    return { offX: 0, offY: 0, scale: 1, rotate: 0, zoom: 1 };
  }

  try {
    const raw = await loader();
    return parseRadarTxt(raw);
  } catch {
    return { offX: 0, offY: 0, scale: 1, rotate: 0, zoom: 1 };
  }
}

async function loadRadarImage(mapName: string) {
  const key = `/src/assets/radar/${mapName}.png`;
  const loader = radarPngModules[key] as (() => Promise<string>) | undefined;

  let src = defaultRadarPng;
  try {
    if (loader) src = await loader();
  } catch {
    src = defaultRadarPng;
  }

  return await loadImage(src, defaultRadarPng);
}

async function loadEventsStreaming(
  onProgress: (pct: number) => void,
  onStatus: (text: string) => void
): Promise<EventMaps> {
  const response = await fetch('/out/events.jsonl', { cache: 'no-cache' });

  if (!response.ok) {
    throw new Error(`Failed to load /out/events.jsonl: HTTP ${response.status}`);
  }

  if (!response.body) {
    throw new Error('events.jsonl response body is empty');
  }

  const contentLength = Number(response.headers.get('content-length')) || 0;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  const maps = createEmptyEventMaps();

  let loadedBytes = 0;
  let buffer = '';
  let currentRound = 0;
  let tScore = 0;
  let ctScore = 0;
  const roundStartTicks: number[] = [];
  const roundKillStats = new Map<number, { total: number; nonKnife: number }>();

  let parsedLines = 0;
  let yieldedAt = 0;

  const handleEvent = (ev: any) => {
    const tick = Number(ev.tick);
    if (!Number.isFinite(tick)) return;

    if (ev.type === 'round_start') {
      currentRound = Number(ev.round) || currentRound;
      roundStartTicks.push(tick);
    }

    maps.roundByTick.set(tick, currentRound);

    if (ev.type === 'kill') {
      const roundNo = Number.isFinite(Number(ev.round)) ? Number(ev.round) : currentRound;
      if (roundNo > 0) {
        if (!roundKillStats.has(roundNo)) {
          roundKillStats.set(roundNo, { total: 0, nonKnife: 0 });
        }
        const stats = roundKillStats.get(roundNo)!;
        stats.total += 1;
        if (!isKnifeWeapon(ev?.data?.weapon)) {
          stats.nonKnife += 1;
        }
      }
    }

    if (ev.type === 'round_end') {
      const roundNo = Number.isFinite(Number(ev.round)) ? Number(ev.round) : currentRound;
      const stats = roundNo > 0 ? roundKillStats.get(roundNo) : null;
      const isKnifeRound = Boolean(stats && stats.total > 0 && stats.nonKnife === 0);
      const winner = String(ev?.data?.winner ?? '');

      if (!isKnifeRound) {
        if (winner === '2') tScore += 1;
        else if (winner === '3') ctScore += 1;
      }

      maps.scoreByTick.set(tick, { t: tScore, ct: ctScore });
    }

    if (ev.type === 'pos') {
      pushByTick(maps.posByTick, tick, ev);
    } else if (ev.type === 'shot') {
      pushByTick(maps.shotsByTick, tick, ev);
    } else if (ev.type === 'tracer' || ev.type === 'tracer_hit') {
      pushByTick(maps.tracersByTick, tick, ev);
    } else if (typeof ev.type === 'string' && ev.type.startsWith('nade_')) {
      pushByTick(maps.nadesByTick, tick, ev);
    } else if (typeof ev.type === 'string' && ev.type.startsWith('bomb_')) {
      pushByTick(maps.bombByTick, tick, ev);
    } else if (typeof ev.type === 'string' && ev.type.startsWith('inv_')) {
      pushByTick(maps.inventoryByTick, tick, ev);
    } else if (ev.type === 'player_flashed') {
      pushByTick(maps.flashByTick, tick, ev);
    } else if (ev.type === 'kill') {
      pushByTick(maps.killsByTick, tick, ev);
    } else if (ev.type === 'econ_round') {
      pushByTick(maps.econByTick, tick, ev);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    loadedBytes += value.length;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      try {
        handleEvent(JSON.parse(line));
      } catch (e) {
        console.warn('Bad JSONL line skipped:', line, e);
      }

      parsedLines += 1;

      if (parsedLines - yieldedAt >= 4000) {
        yieldedAt = parsedLines;
        onStatus(`Parsing events... ${parsedLines.toLocaleString()} lines`);
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
    }

    if (contentLength > 0) {
      onProgress(Math.min(99, Math.round((loadedBytes / contentLength) * 100)));
    }
  }

  const tail = buffer.trim();
  if (tail) {
    try {
      handleEvent(JSON.parse(tail));
      parsedLines += 1;
    } catch (e) {
      console.warn('Bad final JSONL line skipped:', tail, e);
    }
  }

  maps.roundStartTicks = Array.from(new Set(roundStartTicks)).sort((a, b) => a - b);

  const econByRound = new Map<number, { round: number; tick: number; data: any }>();
  for (const [tick, events] of maps.econByTick.entries()) {
    for (const ev of events || []) {
      const round = Number(ev?.round || 0);
      if (!Number.isFinite(round) || round <= 0) continue;

      const prev = econByRound.get(round);
      if (!prev || Number(tick) > Number(prev.tick)) {
        econByRound.set(round, {
          round,
          tick: Number(tick),
          data: ev?.data || {},
        });
      }
    }
  }

  maps.econRounds = Array.from(econByRound.values()).sort((a, b) => a.round - b.round);

  onProgress(100);
  onStatus(`Parsed ${parsedLines.toLocaleString()} lines`);
  return maps;
}

export function useDataLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const activeRequestRef = useRef(0);
  const store = useViewerStore();

  const loadData = useCallback(async (matchId: string) => {
    const requestId = ++activeRequestRef.current;

    setIsLoading(true);
    setError(null);
    setProgress(0);

    store.setPlaying(false);
    store.setPlaybackTick(0);
    store.setIsLoaded(false);

    try {
      if (
        cachedMatchId === matchId &&
        cachedMeta &&
        cachedEventMaps &&
        cachedIndexes
      ) {
        store.setStatus('Using cached demo...');
        store.setMapName(cachedMeta.map || 'unknown');
        store.setEventMaps({ ...cachedEventMaps, ...cachedIndexes } as any);
        store.setPlaybackTick(cachedIndexes.ticksSorted[0] || 0);
        store.setIsLoaded(true);
        setProgress(100);
        return;
      }

      store.setStatus('Loading meta.json...');
      const meta = await loadJSON<MetaJson>('/out/meta.json');
      if (requestId !== activeRequestRef.current) return;

      cachedMeta = meta;

      const mapName = meta.map || 'unknown';
      store.setMapName(mapName);

      store.setStatus('Loading radar txt...');
      const radarTransform = await loadRadarTransform(mapName);
      if (requestId !== activeRequestRef.current) return;
      store.setRadarTransform(radarTransform);

      store.setStatus('Loading radar image...');
      const radarImage = await loadRadarImage(mapName);
      if (requestId !== activeRequestRef.current) return;
      store.setRadarImage(radarImage);

      store.setStatus('Streaming events.jsonl...');
      const eventMaps = await loadEventsStreaming(
        (pct) => {
          if (requestId === activeRequestRef.current) {
            setProgress(pct);
          }
        },
        (text) => {
          if (requestId === activeRequestRef.current) {
            store.setStatus(text);
          }
        }
      );
      if (requestId !== activeRequestRef.current) return;

      store.setStatus('Building indexes...');
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      const indexes = rebuildIndexes(eventMaps);

      cachedMatchId = matchId;
      cachedEventMaps = eventMaps;
      cachedIndexes = indexes;

      store.setEventMaps({ ...eventMaps, ...indexes } as any);
      store.setPlaybackTick(indexes.ticksSorted[0] || 0);
      store.setIsLoaded(true);
      store.setStatus(`Ready: ${indexes.ticksSorted.length} event ticks`);
      setProgress(100);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      store.setStatus(`ERROR: ${message}`);
      console.error('loadData failed:', err);
    } finally {
      if (requestId === activeRequestRef.current) {
        setIsLoading(false);
      }
    }
  }, [store]);

  return { loadData, isLoading, error, progress };
}
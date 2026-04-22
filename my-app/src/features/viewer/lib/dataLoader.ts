import { parseRadarTxt } from './radar';
import type { DemoEvent, RadarTransform } from '@shared/types';

const SHOT_RAY_LEN = 1500;
const ASSUMED_TICKRATE = 64;

interface LoaderState {
  posByTick: Map<number, DemoEvent[]>;
  shotsByTick: Map<number, DemoEvent[]>;
  tracersByTick: Map<number, DemoEvent[]>;
  nadesByTick: Map<number, DemoEvent[]>;
  bombByTick: Map<number, DemoEvent[]>;
  inventoryByTick: Map<number, DemoEvent[]>;
  flashByTick: Map<number, DemoEvent[]>;
  killsByTick: Map<number, DemoEvent[]>;
  econByTick: Map<number, DemoEvent[]>;
  roundByTick: Map<number, number>;
  scoreByTick: Map<number, { t: number; ct: number }>;
  roundStartTicks: number[];
  econRounds: Array<{ round: number; tick: number; data: any }>;
}

function isKnifeWeapon(rawWeapon: unknown): boolean {
  const weapon = String(rawWeapon || '').toLowerCase();
  if (!weapon) return false;
  return weapon.includes('knife') || weapon.includes('bayonet') || weapon.includes('dagger');
}

function pushByTick<T>(map: Map<number, T[]>, tick: number, ev: T): void {
  if (!map.has(tick)) {
    map.set(tick, []);
  }
  map.get(tick)!.push(ev);
}

function sortNumeric(a: number, b: number): number {
  return a - b;
}

function floorTick(sortedTicks: number[], tick: number): number | null {
  let lo = 0;
  let hi = sortedTicks.length - 1;
  let best: number | null = null;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const value = sortedTicks[mid];

    if (value <= tick) {
      best = value;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return best;
}

function ceilTick(sortedTicks: number[], tick: number): number | null {
  let lo = 0;
  let hi = sortedTicks.length - 1;
  let best: number | null = null;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const value = sortedTicks[mid];

    if (value >= tick) {
      best = value;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }

  return best;
}

export function rebuildIndexes(state: LoaderState) {
  const ticksSorted = Array.from(
    new Set([
      ...state.posByTick.keys(),
      ...state.shotsByTick.keys(),
      ...state.tracersByTick.keys(),
      ...state.nadesByTick.keys(),
      ...state.bombByTick.keys(),
      ...state.inventoryByTick.keys(),
      ...state.flashByTick.keys(),
      ...state.killsByTick.keys(),
      ...state.econByTick.keys(),
      ...state.roundByTick.keys(),
      ...state.scoreByTick.keys(),
    ])
  ).sort(sortNumeric);

  return {
    ticksSorted,
    posTicksSorted: Array.from(state.posByTick.keys()).sort(sortNumeric),
    shotTicksSorted: Array.from(state.shotsByTick.keys()).sort(sortNumeric),
    inventoryTicksSorted: Array.from(state.inventoryByTick.keys()).sort(sortNumeric),
    flashTicksSorted: Array.from(state.flashByTick.keys()).sort(sortNumeric),
    killTicksSorted: Array.from(state.killsByTick.keys()).sort(sortNumeric),
    econTicksSorted: Array.from(state.econByTick.keys()).sort(sortNumeric),
  };
}

export async function loadEventsData(eventsText: string): Promise<LoaderState> {
  const posByTick = new Map<number, DemoEvent[]>();
  const shotsByTick = new Map<number, DemoEvent[]>();
  const tracersByTick = new Map<number, DemoEvent[]>();
  const nadesByTick = new Map<number, DemoEvent[]>();
  const bombByTick = new Map<number, DemoEvent[]>();
  const inventoryByTick = new Map<number, DemoEvent[]>();
  const flashByTick = new Map<number, DemoEvent[]>();
  const killsByTick = new Map<number, DemoEvent[]>();
  const econByTick = new Map<number, DemoEvent[]>();
  const roundByTick = new Map<number, number>();
  const scoreByTick = new Map<number, { t: number; ct: number }>();

  let currentRound = 0;
  let tScore = 0;
  let ctScore = 0;
  const roundStartTicks: number[] = [];
  const roundKillStats = new Map<number, { total: number; nonKnife: number }>();

  const lines = eventsText.trim().split('\n');

  for (const line of lines) {
    if (!line) continue;

    const ev: DemoEvent = JSON.parse(line);
    const tick = ev.tick;

    if (ev.type === 'round_start') {
      currentRound = ev.round || 0;
      roundStartTicks.push(tick);
    }

    roundByTick.set(tick, currentRound);

    if (ev.type === 'kill') {
      const roundNo = Number.isFinite(Number(ev.round)) ? Number(ev.round) : currentRound;
      if (roundNo > 0) {
        if (!roundKillStats.has(roundNo)) {
          roundKillStats.set(roundNo, { total: 0, nonKnife: 0 });
        }
        const stats = roundKillStats.get(roundNo)!;
        stats.total += 1;
        if (!isKnifeWeapon(ev.data?.weapon)) {
          stats.nonKnife += 1;
        }
      }
    }

    if (ev.type === 'round_end') {
      const roundNo = Number.isFinite(Number(ev.round)) ? Number(ev.round) : currentRound;
      const stats = roundNo > 0 ? roundKillStats.get(roundNo) : null;
      const isKnifeRound = Boolean(stats && stats.total > 0 && stats.nonKnife === 0);
      const winner = String(ev.data?.winner ?? '');

      if (!isKnifeRound) {
        if (winner === '2') tScore += 1;
        else if (winner === '3') ctScore += 1;
      }

      scoreByTick.set(tick, { t: tScore, ct: ctScore });
    }

    // Route events
    if (ev.type === 'pos') pushByTick(posByTick, tick, ev);
    else if (ev.type === 'shot') pushByTick(shotsByTick, tick, ev);
    else if (ev.type === 'tracer' || ev.type === 'tracer_hit') pushByTick(tracersByTick, tick, ev);
    else if (ev.type.startsWith('nade_')) pushByTick(nadesByTick, tick, ev);
    else if (ev.type.startsWith('bomb_')) pushByTick(bombByTick, tick, ev);
    else if (ev.type.startsWith('inv_')) pushByTick(inventoryByTick, tick, ev);
    else if (ev.type === 'player_flashed') pushByTick(flashByTick, tick, ev);
    else if (ev.type === 'kill') pushByTick(killsByTick, tick, ev);
    else if (ev.type === 'econ_round') pushByTick(econByTick, tick, ev);
  }

  // Process econ rounds
  const econByRound = new Map<number, { tick: number; data: any }>();
  for (const [tick, events] of econByTick.entries()) {
    for (const ev of events || []) {
      const round = Number(ev.round || 0);
      if (!Number.isFinite(round) || round <= 0) continue;

      const prev = econByRound.get(round);
      if (!prev || Number(tick) > Number(prev.tick)) {
        econByRound.set(round, { tick: Number(tick), data: ev.data || {} });
      }
    }
  }

  const econRounds = Array.from(econByRound.entries()).map(([round, value]) => ({
    round,
    ...value,
  })).sort((a, b) => a.round - b.round);

  return {
    posByTick,
    shotsByTick,
    tracersByTick,
    nadesByTick,
    bombByTick,
    inventoryByTick,
    flashByTick,
    killsByTick,
    econByTick,
    roundByTick,
    scoreByTick,
    roundStartTicks: Array.from(new Set(roundStartTicks)).sort((a, b) => a - b),
    econRounds,
  };
}

export function getPosTickFloor(state: { posTicksSorted: number[] }, tick: number): number | null {
  if (state.posTicksSorted.length === 0) return null;
  return floorTick(state.posTicksSorted, tick);
}

export function getPosTickCeil(state: { posTicksSorted: number[] }, tick: number): number | null {
  if (state.posTicksSorted.length === 0) return null;
  return ceilTick(state.posTicksSorted, tick);
}

export function getScoreAtOrBefore(
  state: { scoreByTick: Map<number, { t: number; ct: number }>; scoreTicksSorted?: number[] },
  tick: number
): { t: number; ct: number } {
  // Simple implementation - find the latest score event
  const ticks = Array.from(state.scoreByTick.keys()).sort(sortNumeric);
  const scoreTick = floorTick(ticks, tick);
  
  if (scoreTick === null) return { t: 0, ct: 0 };
  
  return state.scoreByTick.get(scoreTick) || { t: 0, ct: 0 };
}
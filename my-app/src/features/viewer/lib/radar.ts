import type { RadarTransform } from '@shared/types';

export function parseRadarTxt(text: string): RadarTransform {
  const getValue = (key: string): string | null => {
    const re = new RegExp(`"${key}"\\s*"([^"]+)"`);
    const m = text.match(re);
    return m ? m[1] : null;
  };

  const posX = parseFloat(getValue('pos_x') || '0');
  const posY = parseFloat(getValue('pos_y') || '0');
  const scale = parseFloat(getValue('scale') || '1');
  const rotate = parseInt(getValue('rotate') || '0', 10);
  const zoom = parseFloat(getValue('zoom') || '1');

  if (![posX, posY, scale].every(Number.isFinite)) {
    throw new Error('radar txt: missing pos_x/pos_y/scale');
  }

  return { offX: posX, offY: posY, scale, rotate, zoom };
}

function rotateCW(px: number, py: number, w: number, h: number, rot: number) {
  if (rot === 0) return { x: px, y: py };
  if (rot === 1) return { x: h - py, y: px };
  if (rot === 2) return { x: w - px, y: h - py };
  if (rot === 3) return { x: py, y: w - px };
  return { x: px, y: py };
}

function applyZoom(px: number, py: number, w: number, h: number, zoom: number) {
  if (!zoom || zoom === 1) return { x: px, y: py };
  const cx = w / 2;
  const cy = h / 2;
  return { x: cx + (px - cx) * zoom, y: cy + (py - cy) * zoom };
}

export function worldToRadarPx(
  x: number,
  y: number,
  w: number,
  h: number,
  tr: RadarTransform
): { x: number; y: number } {
  let px = (x - tr.offX) / tr.scale;
  let py = (tr.offY - y) / tr.scale;

  ({ x: px, y: py } = rotateCW(px, py, w, h, tr.rotate));
  ({ x: px, y: py } = applyZoom(px, py, w, h, tr.zoom));

  return { x: px, y: py };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpAngleDeg(a: number, b: number, t: number): number {
  let delta = ((b - a + 540) % 360) - 180;
  if (!Number.isFinite(delta)) delta = 0;
  return a + delta * t;
}
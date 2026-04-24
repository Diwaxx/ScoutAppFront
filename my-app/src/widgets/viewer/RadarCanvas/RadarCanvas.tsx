import React, { useEffect, useMemo, useRef } from "react";
import { useViewerStore } from "@entities/demo/model/viewerStore";

interface RadarCanvasProps {
  width?: number;
  height?: number;
}

type ViewerPosEvent = {
  tick: number;
  data?: {
    steam64?: string;
    name?: string;
    team?: string | number;
    x?: number;
    y?: number;
    z?: number;
    yaw?: number;
    hp?: number;
  };
};

type RadarTransform = {
  offX: number;
  offY: number;
  scale: number;
  rotate?: number;
  zoom?: number;
};

const ASSUMED_TICKRATE = 64;
const FLIGHT_TAIL_TICKS = ASSUMED_TICKRATE * 2.5;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function floorTick(sortedTicks: number[], tick: number): number | null {
  let lo = 0;
  let hi = sortedTicks.length - 1;
  let best: number | null = null;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
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
    const mid = (lo + hi) >> 1;
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

function teamColor(team: string | number | undefined) {
  const t = String(team ?? "");
  if (t === "2") return "#ff9f43";
  if (t === "3") return "#63b6ff";
  return "#d1d5db";
}

function worldToRadarPx(
  x: number,
  y: number,
  w: number,
  h: number,
  tr: RadarTransform,
) {
  let px = (x - tr.offX) / tr.scale;
  let py = (tr.offY - y) / tr.scale;

  const rot = Number(tr.rotate || 0);

  if (rot === 1) {
    const nx = h - py;
    const ny = px;
    px = nx;
    py = ny;
  } else if (rot === 2) {
    px = w - px;
    py = h - py;
  } else if (rot === 3) {
    const nx = py;
    const ny = w - px;
    px = nx;
    py = ny;
  }

  const zoom = Number(tr.zoom || 1);

  if (zoom !== 1) {
    const cx = w / 2;
    const cy = h / 2;
    px = cx + (px - cx) * zoom;
    py = cy + (py - cy) * zoom;
  }

  return { x: px, y: py };
}

function applyViewTransform(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoom: number,
  panX: number,
  panY: number,
) {
  const z = clamp(zoom || 1, 1, 4);
  const cx = width / 2;
  const cy = height / 2;

  ctx.setTransform(z, 0, 0, z, cx + panX - cx * z, cy + panY - cy * z);
}

function screenToMapPx(
  sx: number,
  sy: number,
  width: number,
  height: number,
  zoom: number,
  panX: number,
  panY: number,
) {
  const cx = width / 2;
  const cy = height / 2;

  return {
    x: (sx - cx - panX) / zoom + cx,
    y: (sy - cy - panY) / zoom + cy,
  };
}

function isInsideRadarBounds(
  px: number,
  py: number,
  width: number,
  height: number,
  padding = 12,
) {
  return (
    px >= padding &&
    py >= padding &&
    px <= width - padding &&
    py <= height - padding
  );
}

function getInterpolatedPlayers(
  tick: number,
  posTicksSorted: number[],
  posByTick: Map<number, ViewerPosEvent[]>,
) {
  const floor = floorTick(posTicksSorted, tick);
  const ceil = ceilTick(posTicksSorted, tick);

  if (floor == null && ceil == null) return [];

  const floorEvents = floor != null ? posByTick.get(floor) || [] : [];
  const ceilEvents = ceil != null ? posByTick.get(ceil) || [] : [];

  if (floor == null || ceil == null || floor === ceil) {
    const events = floorEvents.length ? floorEvents : ceilEvents;

    return events.map((ev) => ({
      steam64: String(ev.data?.steam64 || ""),
      name: String(ev.data?.name || "unknown"),
      team: ev.data?.team,
      x: Number(ev.data?.x || 0),
      y: Number(ev.data?.y || 0),
      yaw: Number(ev.data?.yaw || 0),
      hp: Number(ev.data?.hp ?? 100),
    }));
  }

  const t = clamp((tick - floor) / Math.max(1, ceil - floor), 0, 1);

  const floorMap = new Map<string, ViewerPosEvent>();
  const ceilMap = new Map<string, ViewerPosEvent>();

  for (const ev of floorEvents) {
    const id = String(ev.data?.steam64 || "");
    if (id) floorMap.set(id, ev);
  }

  for (const ev of ceilEvents) {
    const id = String(ev.data?.steam64 || "");
    if (id) ceilMap.set(id, ev);
  }

  const allIds = new Set([...floorMap.keys(), ...ceilMap.keys()]);

  const out: Array<{
    steam64: string;
    name: string;
    team: string | number | undefined;
    x: number;
    y: number;
    yaw: number;
    hp: number;
  }> = [];

  for (const id of allIds) {
    const a = floorMap.get(id);
    const b = ceilMap.get(id);

    if (a?.data && b?.data) {
      const ax = Number(a.data.x || 0);
      const ay = Number(a.data.y || 0);
      const bx = Number(b.data.x || 0);
      const by = Number(b.data.y || 0);

      const ayaw = Number(a.data.yaw || 0);
      const byaw = Number(b.data.yaw || 0);

      let delta = ((byaw - ayaw + 540) % 360) - 180;
      if (!Number.isFinite(delta)) delta = 0;

      out.push({
        steam64: id,
        name: String(a.data.name || b.data.name || "unknown"),
        team: a.data.team ?? b.data.team,
        x: ax + (bx - ax) * t,
        y: ay + (by - ay) * t,
        yaw: ayaw + delta * t,
        hp: Number(a.data.hp ?? b.data.hp ?? 100),
      });
    } else {
      const ev = a || b;
      if (!ev?.data) continue;

      out.push({
        steam64: id,
        name: String(ev.data.name || "unknown"),
        team: ev.data.team,
        x: Number(ev.data.x || 0),
        y: Number(ev.data.y || 0),
        yaw: Number(ev.data.yaw || 0),
        hp: Number(ev.data.hp ?? 100),
      });
    }
  }

  return out;
}

function nadeColor(grenade: string) {
  switch (grenade) {
    case "smoke":
      return "#bdbdbd";
    case "flash":
      return "#fff799";
    case "he":
      return "#ff8844";
    case "molotov":
      return "#ff6633";
    case "incendiary":
      return "#ff3300";
    case "decoy":
      return "#99ddff";
    default:
      return "#dddddd";
  }
}

function normalizeGrenade(raw: unknown) {
  const g = String(raw || "").toLowerCase();

  if (g.includes("smoke")) return "smoke";
  if (g.includes("flash")) return "flash";
  if (g.includes("molotov")) return "molotov";
  if (g.includes("incendiary")) return "incendiary";
  if (g.includes("decoy")) return "decoy";
  if (g.includes("he")) return "he";

  return g || "nade";
}

function parseNadePos(raw: any) {
  if (!raw) return null;

  const source = raw.pos || raw.position || raw.origin || raw;

  const x = Number(source.x ?? source.X);
  const y = Number(source.y ?? source.Y);
  const z = Number(source.z ?? source.Z ?? 0);

  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  return { x, y, z };
}

function parseNadePath(rawPath: any) {
  if (!Array.isArray(rawPath)) return [];

  return rawPath
    .map(parseNadePos)
    .filter(Boolean) as Array<{ x: number; y: number; z: number }>;
}

function getNadeName(ev: any) {
  return normalizeGrenade(
    ev?.data?.grenade ??
      ev?.data?.weapon ??
      ev?.data?.projectile ??
      ev?.data?.name ??
      ev?.grenade ??
      ev?.weapon,
  );
}

function getNadeEntityId(ev: any) {
  return String(
    ev?.data?.entity_id ??
      ev?.data?.entityId ??
      ev?.data?.projectile_id ??
      ev?.data?.projectileId ??
      ev?.data?.grenade_id ??
      ev?.data?.thrower_steam64 ??
      ev?.data?.thrower ??
      ev?.entity_id ??
      `${getNadeName(ev)}:${ev?.tick}`,
  );
}

function getNadePosition(ev: any) {
  return (
    parseNadePos(ev?.data?.pos) ||
    parseNadePos(ev?.data?.position) ||
    parseNadePos(ev?.data?.origin) ||
    parseNadePos(ev?.data) ||
    parseNadePos(ev)
  );
}

function worldRadiusToPx(
  x: number,
  y: number,
  worldRadius: number,
  width: number,
  height: number,
  tr: RadarTransform,
) {
  const a = worldToRadarPx(x, y, width, height, tr);
  const b = worldToRadarPx(x + worldRadius, y, width, height, tr);

  return Math.hypot(b.x - a.x, b.y - a.y);
}

function grenadeRadius(grenade: string) {
  switch (grenade) {
    case "smoke":
      return 155;
    case "molotov":
    case "incendiary":
      return 165;
    case "he":
      return 360;
    case "flash":
      return 260;
    case "decoy":
      return 120;
    default:
      return 120;
  }
}

function grenadeEffectLifetime(grenade: string) {
  switch (grenade) {
    case "smoke":
      return ASSUMED_TICKRATE * 18;
    case "molotov":
    case "incendiary":
      return ASSUMED_TICKRATE * 7;
    case "he":
      return ASSUMED_TICKRATE * 0.55;
    case "flash":
      return ASSUMED_TICKRATE * 0.7;
    case "decoy":
      return ASSUMED_TICKRATE * 8;
    default:
      return ASSUMED_TICKRATE * 2;
  }
}

function collectNadeEvents(
  nadesByTick: Map<number, any[]>,
  tick: number,
  lookbackTicks: number,
) {
  const out: any[] = [];

  for (const [eventTick, events] of nadesByTick.entries()) {
    if (eventTick < tick - lookbackTicks || eventTick > tick) continue;

    for (const ev of events || []) {
      out.push(ev);
    }
  }

  out.sort((a, b) => Number(a.tick) - Number(b.tick));
  return out;
}

function drawNadeFlights(
  ctx: CanvasRenderingContext2D,
  nadesByTick: Map<number, any[]>,
  tick: number,
  width: number,
  height: number,
  tr: RadarTransform,
) {
  const events = collectNadeEvents(nadesByTick, tick, FLIGHT_TAIL_TICKS);
  const tracks = new Map<string, any[]>();

  for (const ev of events) {
    const type = String(ev.type || "");

    const isFlight =
      type === "nade_flight" ||
      type === "nade_step" ||
      type === "nade_position" ||
      type === "nade_trajectory" ||
      type === "nade_throw";

    if (!isFlight) continue;

    const pos = getNadePosition(ev);
    if (!pos) continue;

    const entityId = getNadeEntityId(ev);

    if (!tracks.has(entityId)) {
      tracks.set(entityId, []);
    }

    tracks.get(entityId)!.push({
      tick: Number(ev.tick),
      pos,
      grenade: getNadeName(ev),
    });
  }

  for (const points of tracks.values()) {
    if (points.length < 1) continue;

    points.sort((a, b) => a.tick - b.tick);

    const head = points[points.length - 1];
    const age = tick - head.tick;
    const alpha = clamp(1 - age / FLIGHT_TAIL_TICKS, 0, 1);

    if (alpha <= 0) continue;

    const color = nadeColor(head.grenade);

    if (points.length >= 2) {
      ctx.save();
      ctx.globalAlpha = 0.75 * alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      let started = false;

      for (const point of points) {
        const p = worldToRadarPx(point.pos.x, point.pos.y, width, height, tr);
        if (!isInsideRadarBounds(p.x, p.y, width, height, 0)) continue;

        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }

      if (started) ctx.stroke();
      ctx.restore();
    }

    const hp = worldToRadarPx(head.pos.x, head.pos.y, width, height, tr);

    if (isInsideRadarBounds(hp.x, hp.y, width, height, 0)) {
      ctx.save();
      ctx.globalAlpha = 0.95 * alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(0,0,0,0.75)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawDetonatedNades(
  ctx: CanvasRenderingContext2D,
  nadesByTick: Map<number, any[]>,
  tick: number,
  width: number,
  height: number,
  tr: RadarTransform,
) {
  const events = collectNadeEvents(nadesByTick, tick, ASSUMED_TICKRATE * 20);

  for (const ev of events) {
    const type = String(ev.type || "");
    if (type !== "nade_detonate" && type !== "nade_explode") continue;

    const grenade = getNadeName(ev);
    const age = tick - Number(ev.tick);
    const lifetime = grenadeEffectLifetime(grenade);

    if (age < 0 || age > lifetime) continue;

    const path = parseNadePath(ev?.data?.path || ev?.data?.trajectory);
    const pos = getNadePosition(ev) || path[path.length - 1];

    if (!pos) continue;

    const fade = clamp(1 - age / lifetime, 0, 1);
    const color = nadeColor(grenade);

    if (path.length >= 2) {
      ctx.save();
      ctx.globalAlpha = 0.55 * fade;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      let started = false;

      for (const point of path) {
        const p = worldToRadarPx(point.x, point.y, width, height, tr);
        if (!isInsideRadarBounds(p.x, p.y, width, height, 0)) continue;

        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }

      if (started) ctx.stroke();
      ctx.restore();
    }

    const p = worldToRadarPx(pos.x, pos.y, width, height, tr);
    if (!isInsideRadarBounds(p.x, p.y, width, height, 0)) continue;

    const radiusPx = Math.max(
      8,
      worldRadiusToPx(pos.x, pos.y, grenadeRadius(grenade), width, height, tr),
    );

    ctx.save();

    if (grenade === "smoke") {
      ctx.globalAlpha = 0.25 * fade;
      ctx.fillStyle = "#d0d0d0";
      ctx.beginPath();
      ctx.arc(p.x, p.y, radiusPx, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.5 * fade;
      ctx.strokeStyle = "#eeeeee";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (grenade === "molotov" || grenade === "incendiary") {
      ctx.globalAlpha = 0.28 * fade;
      ctx.fillStyle = "#ff7814";
      ctx.beginPath();
      ctx.arc(p.x, p.y, radiusPx, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.65 * fade;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.globalAlpha = 0.75 * fade;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radiusPx * 0.45, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 0.9 * fade;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

function drawNades(
  ctx: CanvasRenderingContext2D,
  nadesByTick: Map<number, any[]> | undefined,
  tick: number,
  width: number,
  height: number,
  tr: RadarTransform,
) {
  if (!nadesByTick || nadesByTick.size === 0) return;

  drawNadeFlights(ctx, nadesByTick, tick, width, height, tr);
  drawDetonatedNades(ctx, nadesByTick, tick, width, height, tr);
}

export const RadarCanvas: React.FC<RadarCanvasProps> = ({
  width = 1024,
  height = 1024,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dragRef = useRef<{
    active: boolean;
    lastX: number;
    lastY: number;
  }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  const radarImg = useViewerStore((s: any) => s.radarImg);
  const radarTransform = useViewerStore((s: any) => s.radarTransform ?? s.tr);
  const playbackTick = useViewerStore((s) => s.playbackTick);

  const posByTick = useViewerStore(
    (s: any) => s.posByTick as Map<number, ViewerPosEvent[]>,
  );

  const posTicksSorted = useViewerStore(
    (s: any) => s.posTicksSorted as number[],
  );

  const nadesByTick = useViewerStore(
    (s: any) => s.nadesByTick as Map<number, any[]>,
  );

  const viewZoom = useViewerStore((s: any) => s.viewZoom ?? 1);
  const viewPanX = useViewerStore((s: any) => s.viewPanX ?? 0);
  const viewPanY = useViewerStore((s: any) => s.viewPanY ?? 0);
  const setViewState = useViewerStore((s) => s.setViewState);

  const players = useMemo(() => {
    if (!posTicksSorted?.length || !posByTick) return [];
    return getInterpolatedPlayers(playbackTick, posTicksSorted, posByTick);
  }, [playbackTick, posTicksSorted, posByTick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !radarImg) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const naturalWidth = radarImg.naturalWidth || width;
    const naturalHeight = radarImg.naturalHeight || height;

    canvas.width = naturalWidth;
    canvas.height = naturalHeight;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    applyViewTransform(
      ctx,
      canvas.width,
      canvas.height,
      viewZoom,
      viewPanX,
      viewPanY,
    );

    ctx.drawImage(radarImg, 0, 0, canvas.width, canvas.height);

    if (!radarTransform) return;

    drawNades(
      ctx,
      nadesByTick,
      playbackTick,
      canvas.width,
      canvas.height,
      radarTransform,
    );

    for (const p of players) {
      const pt = worldToRadarPx(
        p.x,
        p.y,
        canvas.width,
        canvas.height,
        radarTransform,
      );

      if (!isInsideRadarBounds(pt.x, pt.y, canvas.width, canvas.height, 12)) {
        continue;
      }

      const color = teamColor(p.team);

      ctx.save();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.95;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 9.5, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0,0,0,0.75)";
      ctx.stroke();

      const rad = (Number(p.yaw || 0) * Math.PI) / 180;
      const dirLen = 18;
      const dx = Math.cos(rad) * dirLen;
      const dy = Math.sin(rad) * dirLen;

      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt.x + dx, pt.y + dy);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      const hp = clamp(Number(p.hp || 0), 0, 100);
      ctx.beginPath();
      ctx.arc(
        pt.x,
        pt.y,
        12,
        -Math.PI / 2,
        -Math.PI / 2 + (Math.PI * 2 * hp) / 100,
      );
      ctx.lineWidth = 3;
      ctx.strokeStyle = hp > 50 ? "#4ade80" : hp > 20 ? "#facc15" : "#f87171";
      ctx.stroke();

      ctx.font = "600 12px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "rgba(0,0,0,0.8)";
      ctx.lineWidth = 3;

      const label = p.name.length > 12 ? `${p.name.slice(0, 12)}…` : p.name;
      ctx.strokeText(label, pt.x, pt.y - 14);
      ctx.fillText(label, pt.x, pt.y - 14);

      ctx.restore();
    }
  }, [
    radarImg,
    radarTransform,
    players,
    nadesByTick,
    playbackTick,
    viewZoom,
    viewPanX,
    viewPanY,
    width,
    height,
  ]);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const sy = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const nextZoom = clamp(viewZoom + (e.deltaY < 0 ? 0.15 : -0.15), 1, 4);

    const before = screenToMapPx(
      sx,
      sy,
      canvas.width,
      canvas.height,
      viewZoom,
      viewPanX,
      viewPanY,
    );

    const after = screenToMapPx(
      sx,
      sy,
      canvas.width,
      canvas.height,
      nextZoom,
      viewPanX,
      viewPanY,
    );

    const nextPanX = viewPanX + (after.x - before.x) * nextZoom;
    const nextPanY = viewPanY + (after.y - before.y) * nextZoom;

    setViewState({
      zoom: nextZoom,
      panX: nextPanX,
      panY: nextPanY,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 1 && e.button !== 2) return;

    e.preventDefault();

    dragRef.current.active = true;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.active) return;

    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;

    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;

    setViewState({
      zoom: viewZoom,
      panX: viewPanX + dx,
      panY: viewPanY + dy,
    });
  };

  const handleMouseUp = () => {
    dragRef.current.active = false;
  };

  const handleDoubleClick = () => {
    setViewState({ zoom: 1, panX: 0, panY: 0 });
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: "100%", height: "100%", display: "block" }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};
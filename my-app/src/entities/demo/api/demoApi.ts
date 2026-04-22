import { apiClient } from '@shared/api/client';
import type { DemoMeta, DemoEvent } from '@shared/types';

export const demoApi = {
  getDemoMeta: (matchId: string): Promise<DemoMeta> => {
    return apiClient<DemoMeta>(`/api/matches/${matchId}/meta`);
  },

  getDemoEvents: async (matchId: string): Promise<DemoEvent[]> => {
    const response = await fetch(`/out/events.jsonl`);
    const text = await response.text();
    
    const lines = text.trim().split('\n');
    return lines.filter(Boolean).map((line) => JSON.parse(line));
  },

  getRadarImage: async (map: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        const fallback = new Image();
        fallback.onload = () => resolve(fallback);
        fallback.onerror = () => reject(new Error(`Failed to load radar for ${map}`));
        fallback.src = '/assets/radar/default_png.png';
      };
      img.src = `/assets/radar/${map}.png`;
    });
  },

  getRadarTxt: async (map: string): Promise<string> => {
    const response = await fetch(`/assets/radar/${map}.txt`);
    return response.text();
  },
};
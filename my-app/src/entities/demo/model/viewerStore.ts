import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  RadarTransform,
  DemoEvent,
  ViewState,
  FilterState,
  ScoreState,
} from '@shared/types';

interface EconRoundData {
  round: number;
  tick: number;
  data: {
    t: { money_total: number; freeze_value: number; buy_type: string };
    ct: { money_total: number; freeze_value: number; buy_type: string };
  };
}

interface ViewerStore {
  // Data
  radarImg: HTMLImageElement | null;
  radarTransform: RadarTransform | null;
  
  // Event maps
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
  scoreByTick: Map<number, ScoreState>;
  
  // Sorted ticks
  ticksSorted: number[];
  posTicksSorted: number[];
  shotTicksSorted: number[];
  inventoryTicksSorted: number[];
  flashTicksSorted: number[];
  killTicksSorted: number[];
  econTicksSorted: number[];
  roundStartTicks: number[];
  econRounds: EconRoundData[];
  
  // Playback state
  playing: boolean;
  playbackTick: number;
  playbackSpeed: number;
  selectedPlayerId: string | null;
  
  // View state
  view: ViewState;
  
  // Filters
  filters: FilterState;
  
  // Status
  status: string;
  mapName: string;
  isLoaded: boolean;
  isLoading: boolean;
  
  // Actions
  setRadarImage: (img: HTMLImageElement) => void;
  setRadarTransform: (tr: RadarTransform) => void;
  setEventMaps: (maps: Partial<ViewerStore>) => void;
  setPlaybackTick: (tick: number) => void;
  setPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setSelectedPlayer: (id: string | null) => void;
  setViewState: (view: Partial<ViewState>) => void;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  setStatus: (status: string) => void;
  setMapName: (name: string) => void;
  setIsLoaded: (loaded: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  radarImg: null,
  radarTransform: null,
  
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
  
  ticksSorted: [],
  posTicksSorted: [],
  shotTicksSorted: [],
  inventoryTicksSorted: [],
  flashTicksSorted: [],
  killTicksSorted: [],
  econTicksSorted: [],
  roundStartTicks: [],
  econRounds: [],
  
  playing: false,
  playbackTick: 0,
  playbackSpeed: 1,
  selectedPlayerId: null,
  
  view: { zoom: 1, panX: 0, panY: 0 },
  
  filters: {
    showPlayers: true,
    showShots: true,
    showTracers: true,
    showNades: true,
    showBomb: true,
    showViewDir: true,
    showTails: true,
    tailLength: 12,
  },
  
  status: 'idle',
  mapName: '',
  isLoaded: false,
  isLoading: false,
};

export const useViewerStore = create<ViewerStore>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setRadarImage: (img) => set({ radarImg: img }),
      setRadarTransform: (tr) => set({ radarTransform: tr }),
      setEventMaps: (maps) => set((state) => ({ ...state, ...maps })),
      setPlaybackTick: (tick) => set({ playbackTick: tick }),
      setPlaying: (playing) => set({ playing }),
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
      setSelectedPlayer: (id) => set({ selectedPlayerId: id }),
      setViewState: (view) => set((state) => ({
        view: { ...state.view, ...view },
      })),
      setFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value },
      })),
      setStatus: (status) => set({ status }),
      setMapName: (mapName) => set({ mapName }),
      setIsLoaded: (isLoaded) => set({ isLoaded }),
      setIsLoading: (isLoading) => set({ isLoading }),
      reset: () => set(initialState),
    }),
    { name: 'ViewerStore' }
  )
);
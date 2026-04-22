
export interface Player {
  id: string;
  nickname: string;
  steam64?: string;
  faceitElo?: number;
  avatarUrl?: string;
  primaryRole?: PlayerRole;
  secondaryRoles?: PlayerRole[];
  aggression?: number;
  teamplay?: number;
  stability?: number;
  decisionIq?: number;
  clutchImpact?: number;
  playstyle?: Playstyle;
  profileSummary?: string;
}

export type PlayerRole = 'entry' | 'support' | 'igl' | 'lurker' | 'awper' | 'anchor' | 'rifler';
export type Playstyle = 'aggressive' | 'balanced' | 'passive';

// Team types
export interface Team {
  id: string;
  name: string;
  averageElo?: number;
  style?: TeamStyle;
  needs?: string[];
  members: TeamMember[];
}

export type TeamStyle = 'aggressive' | 'balanced' | 'structured' | 'loose';

export interface TeamMember {
  playerId: string;
  nickname: string;
  role?: PlayerRole;
}

// Compatibility types
export interface CompatibilityResponse {
  score: number;
  verdict: CompatibilityVerdict;
  pros: string[];
  cons: string[];
  breakdown: CompatibilityBreakdown;
  warnings?: string[];
}

export type CompatibilityVerdict = 'strong_fit' | 'good_fit' | 'risky_fit' | 'poor_fit';

export interface CompatibilityBreakdown {
  roleFit: number;
  playstyleFit: number;
  teamplayFit: number;
  stabilityFit: number;
}

// Candidate types
export type CandidateStatus = 'considering' | 'testing' | 'accepted' | 'rejected';

export interface Candidate {
  id: string;
  teamId: string;
  playerId: string;
  status: CandidateStatus;
  note?: string;
  compatibilityScore?: number;
  createdAt: string;
  updatedAt: string;
}

// Demo types
export interface DemoMeta {
  matchId: string;
  map: string;
  tickRate: number;
  totalTicks: number;
  rounds: number;
}

export interface DemoEvent {
  tick: number;
  type: string;
  round?: number;
  data: Record<string, unknown>;
}

// Viewer types
export interface RadarTransform {
  offX: number;
  offY: number;
  scale: number;
  rotate: number;
  zoom: number;
}

export interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
}

export interface FilterState {
  showPlayers: boolean;
  showShots: boolean;
  showTracers: boolean;
  showNades: boolean;
  showBomb: boolean;
  showViewDir: boolean;
  showTails: boolean;
  tailLength: number;
}

export interface ScoreState {
  t: number;
  ct: number;
}

// Stats types
export interface PlayerStats {
  overview: Record<string, string | number>;
  decisionIq: DecisionIQ;
  role: RoleProfile;
  combat: CombatStats;
  entry: EntryStats;
  multi: MultiStats;
  weapons: Record<string, number>;
  utility: UtilityStats;
  clutch: ClutchStats;
  flashReceived: FlashStats;
}

export interface DecisionIQ {
  total: number;
  grade: string;
  entryScore: number;
  tradeScore: number;
  clutchScore: number;
  utilityScore: number;
}

export interface RoleProfile {
  primary: { role: string; score: number };
  secondary: { role: string; score: number };
  confidence: number;
  topZones: Array<{ zone: string; pct: number }>;
}

export interface CombatStats {
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
  kr: number;
  hs: number;
  hsPercent: number;
}

export interface EntryStats {
  openingKills: number;
  openingDeaths: number;
  entryDuels: number;
  entrySuccess: number;
  entryDiff: number;
}

export interface MultiStats {
  '1k': number;
  '2k': number;
  '3k': number;
  '4k': number;
  '5k': number;
}

export interface UtilityStats {
  total: number;
  flash: number;
  smoke: number;
  he: number;
  fire: number;
  decoy: number;
}

export interface ClutchStats {
  attempts: number;
  wins: number;
  winRate: number;
  '1v1': { wins: number; attempts: number };
  '1v2': { wins: number; attempts: number };
  '1v3plus': { wins: number; attempts: number };
}

export interface FlashStats {
  times: number;
  totalDuration: number;
  avgDuration: number;
  avgIntensity: number;
}
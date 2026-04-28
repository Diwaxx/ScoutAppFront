import React from "react";
import { Link } from "react-router-dom";
import "./TeamPage.css";
import teamSummary from "@/../public/out/team_summary.json";

type TeamSummary = typeof teamSummary;
const summary = teamSummary as TeamSummary;

const MOCK_PLAYERS = [
  {
    playerId: "76561198074762801",
    nickname: "m0NESY",
    avatar: null,
    elo: 2450,
    level: 10,
    role: "AWP",
    flag: "🇷🇺",
    isCaptain: false,
  },
  {
    playerId: "2",
    nickname: "kyxsan",
    avatar: null,
    elo: 2300,
    level: 10,
    role: "ENTRY / IGL",
    flag: "🇲🇰",
    isCaptain: true,
  },
  {
    playerId: "3",
    nickname: "TeSeS",
    avatar: null,
    elo: 2250,
    level: 10,
    role: "LURKER",
    flag: "🇩🇰",
    isCaptain: false,
  },
  {
    playerId: "4",
    nickname: "NiKo",
    avatar: null,
    elo: 2500,
    level: 10,
    role: "SUPPORT",
    flag: "🇧🇦",
    isCaptain: false,
  },
  {
    playerId: "5",
    nickname: "kyousuke",
    avatar: null,
    elo: 2400,
    level: 10,
    role: "CARRY",
    flag: "🇷🇺",
    isCaptain: false,
  },
];

function pct(value: number) {
  return `${Math.round(value)}%`;
}

function scoreClass(value: number) {
  if (value >= 70) return 'good';
  if (value >= 35) return 'mid';
  return 'bad';
}

function formatRoleName(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getRolePlayers(slots: Record<string, string[]> | undefined) {
  if (!slots) return [];
  return Object.entries(slots).map(([role, players]) => ({ role, players }));
}

const MetricCard: React.FC<{
  title: string;
  value: number;
  hint: string;
  className?: string; 
}> = ({ title, value, hint, className }) => {
  const quality = value >= 70 ? "good" : value >= 45 ? "mid" : "bad";

  return (
    <div className={`scope-card metric-card ${scoreClass(value)} ${className || ''}`}>
      <div className="scope-card-head">
        <span>{title}</span>

        <strong className={`metric-value ${quality}`}>{pct(value)}</strong>
      </div>

      <div className="metric-scale">
        <div className="metric-scale-track">
          <div className="metric-scale-segment metric-scale-bad" />
          <div className="metric-scale-segment metric-scale-mid" />
          <div className="metric-scale-segment metric-scale-good" />

          <div
            className="metric-scale-thumb"
            style={{ left: `${Math.max(0, Math.min(value, 100))}%` }}
          />
        </div>

        <div className="metric-scale-labels">
          <span>Плохо</span>
          <span>Средне</span>
          <span>Хорошо</span>
        </div>
      </div>

      <p>{hint}</p>
    </div>
  );
};

const PlayerCard: React.FC<{ player: (typeof MOCK_PLAYERS)[number] }> = ({
  player,
}) => (
  <Link
    to={`/players/${player.playerId}`}
    className={`scope-player ${player.isCaptain ? "captain" : ""}`}
  >
    <div className="player-top-line">
      {player.isCaptain ? <span className="captain-mark">IGL</span> : <span />}
      <span className="player-flag">{player.flag}</span>
    </div>

    <div className="player-avatar">
      {player.avatar ? (
        <img src={player.avatar} alt={player.nickname} />
      ) : (
        <span>{player.nickname.slice(0, 2).toUpperCase()}</span>
      )}
    </div>

    <strong>{player.nickname}</strong>
    <small>{player.role}</small>

    <div className="player-bottom">
      <span>LVL {player.level}</span>
      <b>{player.elo}</b>
    </div>
  </Link>
);

const RoleCard: React.FC<{
  title: string;
  slots: Record<string, string[]> | undefined;
}> = ({ title, slots }) => {
  const rows = getRolePlayers(slots);

  return (
    <div className="scope-card role-card">
      <div className="scope-card-title">{title}</div>

      <div className="role-list">
        {rows.map((row) => (
          <div className="role-row" key={row.role}>
            <span>{formatRoleName(row.role)}</span>
            <strong>{row.players.join(", ")}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

const DistributionCard: React.FC<{
  title: string;
  data: Record<string, number>;
}> = ({ title, data }) => {
  const max = Math.max(...Object.values(data), 1);

  return (
    <div className="scope-card distribution-card">
      <div className="scope-card-title">{title}</div>

      <div className="distribution-list">
        {Object.entries(data).map(([key, value]) => (
          <div className="distribution-row" key={key}>
            <div className="distribution-label">
              <span>{formatRoleName(key)}</span>
              <b>{value}</b>
            </div>
            <div className="distribution-track">
              <div style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TeamPage: React.FC = () => {
  return (
    <div className="scope-team-page">
      <section className="scope-hero">
        <div>
          <p className="eyebrow">TeamScope Analytics</p>
          <h1>{summary.team_name}</h1>

          <div className="hero-tags">
            <span>{summary.playstyle}</span>
            <span>{summary.structure_level}</span>
            <span>{summary.sample_matches_count} matches</span>
            <span>
              confidence {Math.round(summary.confidence_score * 100)}%
            </span>
          </div>

          <p className="hero-note">{summary.confidence_note}</p>
        </div>

        <Link
          to={`/teams/${summary.team_id}/candidates`}
          className="scope-main-btn"
        >
          Scout candidates
        </Link>
      </section>

      <section className="scope-roster-section">
        <div className="block-header">
          <div>
            <p className="block-kicker">Lineup</p>
            <h2>Team Roster</h2>
          </div>
          <span>Main 5 players</span>
        </div>

        <div className="scope-roster-big">
          {MOCK_PLAYERS.map((player) => (
            <PlayerCard key={player.playerId} player={player} />
          ))}
        </div>
      </section>

      <section className="scope-analytics-section">
        <div className="block-header">
          <div>
            <p className="block-kicker">Stats</p>
            <h2>Team Analytics</h2>
          </div>
          <span>Structure & performance</span>
        </div>

        <div className="scope-grid metrics-grid">
         
          <MetricCard
            title="Teamplay"
            value={summary.teamplay_avg}
            hint="Utility, trading and coordinated actions."
            className="large"
          />
 
          <MetricCard
            title="Positioning"
            value={summary.positioning_avg}
            hint="Map control quality and role discipline."
            className="large"
          />
          <MetricCard
            title="Clutch"
            value={summary.clutch_avg}
            hint="Late-round conversion and pressure handling."
            className="large"
          />
                    <MetricCard
            title="Aggression"
            value={summary.aggression_avg}
            hint="Tempo, entry activity and willingness to take space."
            
          />
          <MetricCard
            title="Stability"
            value={summary.stability_avg}
            hint="How repeatable and controlled the team structure is."
            
          />
        </div>

        <div className="scope-grid two-col">
          <RoleCard title="T-side role slots" slots={summary.t_role_slots} />
          <RoleCard title="CT-side role slots" slots={summary.ct_role_slots} />
        </div>

        <div className="scope-card summary-card">
          <div>
            <div className="scope-card-title">Missing roles</div>
            {summary.missing_roles.length === 0 ? (
              <p>No critical missing roles detected.</p>
            ) : (
              <p>{summary.missing_roles.join(", ")}</p>
            )}
          </div>

          <div className="summary-status">
            <span>Current identity</span>
            <strong>
              {summary.playstyle} / {summary.structure_level}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
};

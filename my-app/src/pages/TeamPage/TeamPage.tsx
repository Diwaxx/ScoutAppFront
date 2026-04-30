import React from "react";
import { Link } from "react-router-dom";
import "./TeamPage.css";
import teamSummary from "@/../public/out/team_summary.json";
import mirageRadar from "@/assets/radar/de_mirage.png";
import { FALCONS_MATCHES } from "@/shared/data/falconsMatches";

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
    playerId: "76561198057282432",
    nickname: "kyxsan",
    avatar: null,
    elo: 2300,
    level: 10,
    role: "ENTRY / IGL",
    flag: "🇲🇰",
    isCaptain: true,
  },
  {
    playerId: "76561197996678278",
    nickname: "TeSeS",
    avatar: null,
    elo: 2250,
    level: 10,
    role: "LURKER",
    flag: "🇩🇰",
    isCaptain: false,
  },
  {
    playerId: "76561198041683378",
    nickname: "NiKo",
    avatar: null,
    elo: 2500,
    level: 10,
    role: "SUPPORT",
    flag: "🇧🇦",
    isCaptain: false,
  },
  {
    playerId: "76561199032006224",
    nickname: "kyousuke",
    avatar: null,
    elo: 2400,
    level: 10,
    role: "CARRY",
    flag: "🇷🇺",
    isCaptain: false,
  },
];

const CT_RADAR_POSITIONS: Record<
  string,
  { x: number; y: number; dx?: number; dy?: number }
> = {
 Window: { x: 45, y: 43, dx: -10, dy: 10 },      // m0NESY ниже
  Connector: { x: 49, y: 53, dx: 14, dy: 4 },     // NiKo правее
  Short: { x: 53, y: 38, dx: 24, dy: -6 },        // kyousuke выше
  "A anchor": { x: 53, y: 75, dx: 8, dy: 12 },
  "B anchor": { x: 24, y: 32, dx: -6, dy: -6 },
};

function pct(value: number) {
  return `${Math.round(value)}%`;
}

function scoreClass(value: number) {
  if (value >= 70) return "good";
  if (value >= 35) return "mid";
  return "bad";
}

function getPlayerActivePosition(nickname: string) {
  const slots = summary.ct_active_role_slots as Record<string, string[]> | undefined;
  if (!slots) return null;

  for (const [position, players] of Object.entries(slots)) {
    if (players.includes(nickname)) return position;
  }

  return null;
}

const MetricCard: React.FC<{
  title: string;
  value: number;
  hint: string;
  className?: string;
}> = ({ title, value, hint, className }) => {
  const quality = scoreClass(value);

  return (
    <div className={`scope-card metric-card ${quality} ${className || ""}`}>
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

const TeamRadarCard: React.FC = () => {
  return (
    <div className="scope-card team-radar-card">
      <div className="team-radar-head">
        <div>
          <p className="block-kicker">Map setup</p>
          <h2>Mirage CT Setup</h2>
        </div>

        <div className="team-radar-tags">
          <span>{summary.structure_level}</span>
          <span>CT positions</span>
        </div>
      </div>

      <div className="team-radar-wrap">
        <img className="team-radar-img" src={mirageRadar} alt="de_mirage radar" />

        {MOCK_PLAYERS.map((player) => {
          const position = getPlayerActivePosition(player.nickname);
          if (!position) return null;

          const point = CT_RADAR_POSITIONS[position];
          if (!point) return null;

          return (
            <Link
              key={player.playerId}
              to={`/players/${player.playerId}`}
              className={`radar-player-chip ${player.isCaptain ? "captain" : ""}`}
              style={{
                left: `calc(${point.x}% + ${point.dx || 0}px)`,
                top: `calc(${point.y}% + ${point.dy || 0}px)`,
              }}
            >
              <span className="radar-player-avatar">
                {player.nickname.slice(0, 2).toUpperCase()}
              </span>

              <span className="radar-player-info">
                <strong>{player.nickname}</strong>
                <small>{position}</small>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
const MatchesPreviewBlock: React.FC = () => (
  <section className="matches-preview-section">
    <div className="block-header">
      <div>
        <p className="block-kicker">History</p>
        <h2>All matches</h2>
      </div>
      <span>Click map to open details</span>
    </div>

    <div className="matches-preview-grid">
      {FALCONS_MATCHES.map((match) => (
        <Link
          key={match.id}
          to={`/teams/team-1/matches/${match.id}`}
          className={`match-preview-card ${match.result}`}
        >
          <div>
            <strong>{match.map}</strong>
            <span>{match.title}</span>
          </div>

          <b>{match.score}</b>
        </Link>
      ))}
    </div>
  </section>
);
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
            <span>confidence {Math.round(summary.confidence_score * 100)}%</span>
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

        <div className="scope-grid radar-grid">
          <TeamRadarCard />
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
        <MatchesPreviewBlock />
      </section>
      
    </div>
  );
};
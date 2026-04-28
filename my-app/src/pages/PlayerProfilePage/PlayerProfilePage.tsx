import React from "react";
import { Link, useParams } from "react-router-dom";
import data from "@/../public/out/player_summaries.json";
import "./PlayerProfilePage.css";

type PlayerSummary = {
  player_id: string;
  nickname: string;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  damage: number;
  adr: number;
  rounds_played: number;
  survival_rounds: number;
  opening_kills: number;
  opening_deaths: number;
  entry_attempts: number;
  first_contact_rate: number;
  trades_given: number;
  trades_received: number;
  flash_assists: number;
  smokes_thrown: number;
  flashes_thrown: number;
  molotovs_thrown: number;
  he_thrown: number;
  support_utility_count: number;
  awp_kills: number;
  awp_rounds_pct: number;
  deaths_without_trade_pct: number;
  isolated_deaths_pct: number;
  ct_position_role: string;
  ct_function_role: string;
  ct_active_role: string;
  ct_role_type: string;
  ct_position_shares: Record<string, number>;
  clutches_attempted: number;
  clutches_won: number;
  clutch_win_rate: number;
};

const players = data as PlayerSummary[];

function ratio(a: number, b: number) {
  if (!b) return a.toFixed(2);
  return (a / b).toFixed(2);
}

function percent(value: number) {
  return `${Math.round(value)}%`;
}

function decimalPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

const StatBox = ({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) => (
  <div className="hltv-stat-box">
    <span>{label}</span>
    <strong>{value}</strong>
    {sub && <small>{sub}</small>}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="profile-info-row">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const ShareBar = ({ label, value }: { label: string; value: number }) => (
  <div className="share-row">
    <div className="share-head">
      <span>{label}</span>
      <b>{value.toFixed(1)}%</b>
    </div>
    <div className="share-track">
      <div style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  </div>
);

export const PlayerProfilePage: React.FC = () => {
  const { playerId } = useParams();
  const player = players.find((p) => p.player_id === playerId);

  if (!player) {
    return (
      <div className="player-profile-page">
        <div className="profile-not-found">
          <h1>Player not found</h1>
          <Link to="/teams/team-1">Back to team</Link>
        </div>
      </div>
    );
  }

  const kd = ratio(player.kills, player.deaths);
  const hsRate = player.kills ? Math.round((player.headshots / player.kills) * 100) : 0;
  const survivalRate = player.rounds_played
    ? Math.round((player.survival_rounds / player.rounds_played) * 100)
    : 0;

  return (
    <div className="player-profile-page">
      <section className="profile-hero">
        <div className="profile-left-card">
          <div className="profile-avatar-big">{initials(player.nickname)}</div>

          <div className="profile-main-info">
            <p className="profile-kicker">TeamScope Player Profile</p>
            <h1>{player.nickname}</h1>

            <div className="profile-tags">
              <span>{player.ct_function_role}</span>
              <span>{player.ct_active_role}</span>
              <span>{player.ct_role_type}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="headline-stats">
        <StatBox label="K-D" value={`${player.kills}-${player.deaths}`} sub={`K/D ${kd}`} />
        <StatBox label="ADR" value={player.adr.toFixed(1)} sub={`${player.damage} damage`} />
        <StatBox label="HS%" value={`${hsRate}%`} sub={`${player.headshots} headshots`} />
        <StatBox label="Survival" value={`${survivalRate}%`} sub={`${player.survival_rounds}/${player.rounds_played} rounds`} />
        <StatBox label="Opening" value={`${player.opening_kills}-${player.opening_deaths}`} sub={`${player.entry_attempts} attempts`} />
      </section>

      <section className="profile-layout">
        <div className="profile-main-column">
          <div className="profile-panel">
            <div className="panel-title">
              <h2>Performance</h2>
              <span>Core match impact</span>
            </div>

            <div className="stats-table">
              <InfoRow label="Kills" value={player.kills} />
              <InfoRow label="Deaths" value={player.deaths} />
              <InfoRow label="Assists" value={player.assists} />
              <InfoRow label="First contact rate" value={decimalPercent(player.first_contact_rate)} />
              <InfoRow label="Trades given" value={player.trades_given} />
              <InfoRow label="Trades received" value={player.trades_received} />
              <InfoRow label="Deaths without trade" value={percent(player.deaths_without_trade_pct)} />
              <InfoRow label="Isolated deaths" value={percent(player.isolated_deaths_pct)} />
            </div>
          </div>

          <div className="profile-panel">
            <div className="panel-title">
              <h2>Utility</h2>
              <span>Support contribution</span>
            </div>

            <div className="utility-grid">
              <StatBox label="Smokes" value={player.smokes_thrown} />
              <StatBox label="Flashes" value={player.flashes_thrown} />
              <StatBox label="Molotovs" value={player.molotovs_thrown} />
              <StatBox label="HE" value={player.he_thrown} />
              <StatBox label="Flash assists" value={player.flash_assists} />
              <StatBox label="Total utility" value={player.support_utility_count} />
            </div>
          </div>
        </div>

        <aside className="profile-aside-column">
          <div className="profile-panel role-panel">
            <div className="panel-title">
              <h2>Role</h2>
              <span>Detected identity</span>
            </div>

            <div className="role-badge-large">{player.ct_function_role}</div>

            <InfoRow label="Base role" value={player.ct_position_role} />
            <InfoRow label="Active role" value={player.ct_active_role} />
            <InfoRow label="AWP kills" value={player.awp_kills} />
            <InfoRow label="AWP rounds" value={percent(player.awp_rounds_pct)} />
          </div>

          <div className="profile-panel">
            <div className="panel-title">
              <h2>Clutch</h2>
              <span>Late-round output</span>
            </div>

            <div className="clutch-circle">
              <strong>{decimalPercent(player.clutch_win_rate)}</strong>
              <span>{player.clutches_won}/{player.clutches_attempted}</span>
            </div>
          </div>

          <div className="profile-panel">
            <div className="panel-title">
              <h2>CT Position Shares</h2>
              <span>Where he plays</span>
            </div>

            <div className="shares-list">
              {Object.entries(player.ct_position_shares || {}).map(([key, value]) => (
                <ShareBar key={key} label={key} value={value} />
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};
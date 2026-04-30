import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import data from "@/../public/out/player_summaries.json";
import {
  clearAuthTokens,
  fetchMe,
  getAccessToken,
} from "@/shared/auth/FacietAuth";
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

type FaceitMe = {
  id?: number;
  email?: string;
  faceit_nickname?: string;
  nickname?: string;
  avatar_url?: string;
  user?: {
    id?: number;
    email?: string;
    faceit_nickname?: string;
    nickname?: string;
    avatar_url?: string;
  };
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

function getFaceitUser(me: FaceitMe | null) {
  if (!me) return null;

  const user = me.user || me;

  return {
    id: user.id,
    nickname: user.faceit_nickname || user.nickname || "FACEIT User",
    avatar: user.avatar_url || "",
    email: user.email || "",
  };
}

async function apiFetch(path: string, options?: RequestInit) {
  const access = getAccessToken();

  const response = await fetch(path, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
      ...(options?.headers || {}),
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.detail || result?.error || `HTTP ${response.status}`);
  }

  return result;
}

const StatBox = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) => (
  <div className="hltv-stat-box">
    <span>{label}</span>
    <strong>{value}</strong>
    {sub && <small>{sub}</small>}
  </div>
);

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
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

  const player = players.find((p) => String(p.player_id) === String(playerId));

  const [me, setMe] = useState<FaceitMe | null>(null);

  const [demoUrl, setDemoUrl] = useState("");
  const [demoJobLoading, setDemoJobLoading] = useState(false);
  const [demoJobStatus, setDemoJobStatus] = useState("");
  const [demoJobError, setDemoJobError] = useState<string | null>(null);
  const [uploadedStats, setUploadedStats] = useState<PlayerSummary | null>(null);

  useEffect(() => {
    const loadFaceitProfile = async () => {
      if (!getAccessToken()) return;

      try {
        const data = await fetchMe();
        setMe(data);
      } catch (err) {
        console.error("FACEIT profile load failed:", err);
        clearAuthTokens();
        setMe(null);
      }
    };

    void loadFaceitProfile();
  }, []);

  const faceitUser = getFaceitUser(me);
  const activePlayer = uploadedStats || player;

  async function startDemoJob() {
    setDemoJobLoading(true);
    setDemoJobError(null);
    setDemoJobStatus("creating job...");

    try {
      const access = getAccessToken();

      if (!access) {
        throw new Error("Сначала авторизуйся через FACEIT");
      }

      if (!demoUrl.trim()) {
        throw new Error("Вставь ссылку на демку");
      }

      const teamName = `authorized-user-${playerId || faceitUser?.id || "unknown"}`;
      const focusPlayer = faceitUser?.nickname || activePlayer?.nickname || "";

      const job = await apiFetch("/api/demo-jobs/", {
        method: "POST",
        body: JSON.stringify({
          team_name: teamName,
          demo_urls: [demoUrl.trim()],
          force: true,
          focus_player: focusPlayer,
          faceit_enabled: true,
        }),
      });

      const jobId = job.id;
      if (!jobId) {
        throw new Error("Backend не вернул job.id");
      }

      setDemoJobStatus(`job created: ${jobId}`);

      let finalJob = job;

      for (let i = 0; i < 120; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        finalJob = await apiFetch(`/api/demo-jobs/${jobId}/`);

        setDemoJobStatus(finalJob.status || "processing...");

        if (finalJob.status === "finished") break;

        if (
          finalJob.status === "failed" ||
          finalJob.status === "error" ||
          finalJob.status === "failed_runtime"
        ) {
          throw new Error(finalJob.error_message || "Demo parsing failed");
        }
      }

      if (finalJob.status !== "finished") {
        throw new Error("Парсинг слишком долго идет. Попробуй обновить позже.");
      }

      setDemoJobStatus("loading parsed stats...");

      const playersResult = await apiFetch(`/api/demo-results/${teamName}/players/`);

      const playersList: PlayerSummary[] = Array.isArray(playersResult)
        ? playersResult
        : playersResult.players ||
          playersResult.results ||
          playersResult.player_summaries ||
          [];

      const myStats =
        playersList.find((p) => String(p.player_id) === String(playerId)) ||
        playersList.find((p) => p.nickname === faceitUser?.nickname) ||
        playersList.find((p) => p.nickname === activePlayer?.nickname) ||
        playersList[0];

      if (!myStats) {
        throw new Error("Стата игрока не найдена в результате демки");
      }

      setUploadedStats(myStats);
      setDemoJobStatus("stats updated");
    } catch (err) {
      setDemoJobError(err instanceof Error ? err.message : String(err));
      setDemoJobStatus("");
    } finally {
      setDemoJobLoading(false);
    }
  }

  const renderDemoJobBox = () => (
    <div className="demo-job-box">
      <input
        value={demoUrl}
        onChange={(e) => {
          setDemoUrl(e.target.value);
          setDemoJobError(null);
          setDemoJobStatus("");
        }}
        placeholder="FACEIT demo URL / demo download link"
        disabled={demoJobLoading}
      />

      <button type="button" onClick={startDemoJob} disabled={demoJobLoading}>
        {demoJobLoading ? "Parsing..." : "Load demo stats"}
      </button>

      {demoJobStatus && <span className="demo-job-status">{demoJobStatus}</span>}
      {demoJobError && <span className="demo-job-error">{demoJobError}</span>}
    </div>
  );

  if (!activePlayer) {
    return (
      <div className="player-profile-page">
        <section className="profile-hero">
          <div className="profile-left-card">
            <div className="profile-avatar-big">
              {faceitUser?.avatar ? (
                <img
                  src={faceitUser.avatar}
                  alt={faceitUser.nickname}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "22px",
                  }}
                />
              ) : (
                initials(faceitUser?.nickname || "User")
              )}
            </div>

            <div className="profile-main-info">
              <p className="profile-kicker">FACEIT User Profile</p>
              <h1>{faceitUser?.nickname || `User #${playerId}`}</h1>

              <div className="profile-tags">
                <span>Authorized user</span>
                <span>ID: {playerId}</span>
              </div>

              {renderDemoJobBox()}
            </div>
          </div>

          <div className="profile-panel faceit-account-card">
            <div className="panel-title">
              <h2>FACEIT Account</h2>
              <span>new user</span>
            </div>

            {faceitUser ? (
              <div className="faceit-account-body">
                <div className="faceit-account-avatar">
                  {faceitUser.avatar ? (
                    <img src={faceitUser.avatar} alt={faceitUser.nickname} />
                  ) : (
                    <span>{initials(faceitUser.nickname)}</span>
                  )}
                </div>

                <div className="faceit-account-info">
                  <strong>{faceitUser.nickname}</strong>
                  {faceitUser.email && <span>{faceitUser.email}</span>}
                  <small>ID: {playerId}</small>
                </div>
              </div>
            ) : (
              <div className="faceit-account-empty">
                <strong>User profile</strong>
                <span>
                  Пользователь #{playerId} создан, но данные FACEIT еще не загружены.
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="headline-stats">
          <StatBox label="Status" value="Created" sub="backend user exists" />
          <StatBox label="User ID" value={playerId || "-"} sub="local profile id" />
          <StatBox label="Source" value="FACEIT" sub="auth provider" />
          <StatBox label="Stats" value="Load" sub="paste demo URL to parse stats" />
          <StatBox label="TeamScope" value="New" sub="profile initialized" />
        </section>
      </div>
    );
  }

  const kd = ratio(activePlayer.kills, activePlayer.deaths);
  const hsRate = activePlayer.kills
    ? Math.round((activePlayer.headshots / activePlayer.kills) * 100)
    : 0;
  const survivalRate = activePlayer.rounds_played
    ? Math.round((activePlayer.survival_rounds / activePlayer.rounds_played) * 100)
    : 0;

  return (
    <div className="player-profile-page">
      <section className="profile-hero">
        <div className="profile-left-card">
          <div className="profile-avatar-big">
            {uploadedStats && faceitUser?.avatar ? (
              <img
                src={faceitUser.avatar}
                alt={faceitUser.nickname}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "22px",
                }}
              />
            ) : (
              initials(activePlayer.nickname)
            )}
          </div>

          <div className="profile-main-info">
            <p className="profile-kicker">
              {uploadedStats ? "Uploaded Demo Stats" : "TeamScope Player Profile"}
            </p>

            <h1>
              {uploadedStats
                ? faceitUser?.nickname || activePlayer.nickname
                : activePlayer.nickname}
            </h1>

            <div className="profile-tags">
              <span>{activePlayer.ct_function_role}</span>
              <span>{activePlayer.ct_active_role}</span>
              <span>{activePlayer.ct_role_type}</span>
            </div>

            {renderDemoJobBox()}
          </div>
        </div>

        <div className="profile-panel faceit-account-card">
          <div className="panel-title">
            <h2>FACEIT Account</h2>
            <span>authorized user</span>
          </div>

          {faceitUser ? (
            <div className="faceit-account-body">
              <div className="faceit-account-avatar">
                {faceitUser.avatar ? (
                  <img src={faceitUser.avatar} alt={faceitUser.nickname} />
                ) : (
                  <span>{initials(faceitUser.nickname)}</span>
                )}
              </div>

              <div className="faceit-account-info">
                <strong>{faceitUser.nickname}</strong>
                {faceitUser.email && <span>{faceitUser.email}</span>}
                {faceitUser.id && <small>ID: {faceitUser.id}</small>}
              </div>
            </div>
          ) : (
            <div className="faceit-account-empty">
              <strong>Not authorized</strong>
              <span>Войди через FACEIT, чтобы увидеть свой ник и аватар.</span>
            </div>
          )}
        </div>
      </section>

      <section className="headline-stats">
        <StatBox
          label="K-D"
          value={`${activePlayer.kills}-${activePlayer.deaths}`}
          sub={`K/D ${kd}`}
        />
        <StatBox
          label="ADR"
          value={Number(activePlayer.adr || 0).toFixed(1)}
          sub={`${activePlayer.damage} damage`}
        />
        <StatBox
          label="HS%"
          value={`${hsRate}%`}
          sub={`${activePlayer.headshots} headshots`}
        />
        <StatBox
          label="Survival"
          value={`${survivalRate}%`}
          sub={`${activePlayer.survival_rounds}/${activePlayer.rounds_played} rounds`}
        />
        <StatBox
          label="Opening"
          value={`${activePlayer.opening_kills}-${activePlayer.opening_deaths}`}
          sub={`${activePlayer.entry_attempts} attempts`}
        />
      </section>

      <section className="profile-layout">
        <div className="profile-main-column">
          <div className="profile-panel">
            <div className="panel-title">
              <h2>Performance</h2>
              <span>{uploadedStats ? "from parsed demo" : "saved analytics"}</span>
            </div>

            <div className="stats-table">
              <InfoRow label="Kills" value={activePlayer.kills} />
              <InfoRow label="Deaths" value={activePlayer.deaths} />
              <InfoRow label="Assists" value={activePlayer.assists} />
              <InfoRow
                label="First contact rate"
                value={decimalPercent(activePlayer.first_contact_rate)}
              />
              <InfoRow label="Trades given" value={activePlayer.trades_given} />
              <InfoRow label="Trades received" value={activePlayer.trades_received} />
              <InfoRow
                label="Deaths without trade"
                value={percent(activePlayer.deaths_without_trade_pct)}
              />
              <InfoRow
                label="Isolated deaths"
                value={percent(activePlayer.isolated_deaths_pct)}
              />
            </div>
          </div>

          <div className="profile-panel">
            <div className="panel-title">
              <h2>Utility</h2>
              <span>support contribution</span>
            </div>

            <div className="utility-grid">
              <StatBox label="Smokes" value={activePlayer.smokes_thrown} />
              <StatBox label="Flashes" value={activePlayer.flashes_thrown} />
              <StatBox label="Molotovs" value={activePlayer.molotovs_thrown} />
              <StatBox label="HE" value={activePlayer.he_thrown} />
              <StatBox label="Flash assists" value={activePlayer.flash_assists} />
              <StatBox label="Total utility" value={activePlayer.support_utility_count} />
            </div>
          </div>
        </div>

        <aside className="profile-aside-column">
          <div className="profile-panel">
            <div className="panel-title">
              <h2>Role</h2>
              <span>detected identity</span>
            </div>

            <div className="role-badge-large">{activePlayer.ct_function_role}</div>

            <div className="role-panel">
              <InfoRow label="Base role" value={activePlayer.ct_position_role} />
              <InfoRow label="Active role" value={activePlayer.ct_active_role} />
              <InfoRow label="AWP kills" value={activePlayer.awp_kills} />
              <InfoRow
                label="AWP rounds"
                value={percent(activePlayer.awp_rounds_pct)}
              />
            </div>
          </div>

          <div className="profile-panel">
            <div className="panel-title">
              <h2>Clutch</h2>
              <span>late-round output</span>
            </div>

            <div className="clutch-circle">
              <strong>{decimalPercent(activePlayer.clutch_win_rate)}</strong>
              <span>
                {activePlayer.clutches_won}/{activePlayer.clutches_attempted}
              </span>
            </div>
          </div>

          <div className="profile-panel">
            <div className="panel-title">
              <h2>CT Position Shares</h2>
              <span>where he plays</span>
            </div>

            <div className="shares-list">
              {Object.entries(activePlayer.ct_position_shares || {}).map(
                ([key, value]) => (
                  <ShareBar key={key} label={key} value={value} />
                )
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};
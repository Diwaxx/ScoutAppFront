import React from "react";
import { Link, useParams } from "react-router-dom";
import { FALCONS_MATCHES } from "@/shared/data/falconsMatches";
import "./MatchDetailsPage.css";

export const MatchDetailsPage: React.FC = () => {
  const { matchId } = useParams();
  const match = FALCONS_MATCHES.find((m) => m.id === matchId);

  if (!match) {
    return (
      <div className="match-page">
        <h1>Match not found</h1>
        <Link to="/teams/team-1">Back to team</Link>
      </div>
    );
  }

  return (
    <div className="match-page">
      <Link to="/teams/team-1" className="match-back">
        ← Back to team
      </Link>

      <section className={`match-hero ${match.result}`}>
        <div>
          <p className="match-kicker">{match.map}</p>
          <h1>{match.title}</h1>
          <span>{match.date}</span>
        </div>

        <div className="match-final-score">
          <strong>{match.score}</strong>
          <small>{match.result === "win" ? "WIN" : "LOSS"}</small>
        </div>
      </section>

      <section className="match-scoreboard">
        <div className="scoreboard-head">
          <span>Player</span>
          <span>K</span>
          <span>D</span>
          <span>A</span>
          <span>KDA</span>
        </div>

        {match.players.map((p) => {
          const kda = ((p.k + p.a) / Math.max(1, p.d)).toFixed(2);

          return (
            <div className="scoreboard-row" key={p.nickname}>
              <strong>{p.nickname}</strong>
              <span>{p.k}</span>
              <span>{p.d}</span>
              <span>{p.a}</span>
              <b>{kda}</b>
            </div>
          );
        })}
      </section>
    </div>
  );
};
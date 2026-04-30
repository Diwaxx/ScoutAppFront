import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FaceitAuthButton } from "@features/auth/FaceitAuthButton";
import { fetchMe, getAccessToken, getPlayerProfileId } from "@/shared/auth/FacietAuth";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== "/" && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      style={{
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: 500,
        color: isActive ? "#7ed4ff" : "#afc0d6",
        background: isActive ? "rgba(126,212,255,0.2)" : "transparent",
        textDecoration: "none",
        transition: "all 0.15s",
      }}
    >
      {children}
    </Link>
  );
}

export function Layout() {
  const [nickname, setNickname] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const navigation = [
    { name: "Dashboard", path: "/" },
    { name: "Players", path: "/players" },
    { name: "Team", path: "/teams/1" },
    { name: "Candidates", path: "/teams/1/candidates" },
    { name: "Demo Viewer", path: "/demo/latest" },
  ];

  useEffect(() => {
    const loadUser = async () => {
      if (!getAccessToken()) {
        setNickname("");
        setAvatarUrl("");
        return;
      }

      try {
        const me = await fetchMe();
        const user = me?.user || me;

        setNickname(
          user?.faceit_nickname || user?.nickname || user?.username || "FACEIT",
        );

        setAvatarUrl(user?.avatar_url || "");
      } catch {
        setNickname("");
        setAvatarUrl("");
      }
    };

    void loadUser();

    window.addEventListener("storage", loadUser);
    window.addEventListener("focus", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("focus", loadUser);
    };
  }, []);

  const initials = nickname ? nickname.slice(0, 2).toUpperCase() : "??";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(165deg, #07111b, #0d1929)",
        color: "#ecf3ff",
        fontFamily: '"Exo 2", sans-serif',
      }}
    >
      <nav
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(8,14,23,0.76)",
          backdropFilter: "blur(3px)",
          padding: "0 16px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <Link
              to="/"
              style={{
                fontFamily: '"Exo 2", sans-serif',
                fontWeight: "bold",
                fontSize: "18px",
                color: "#ecf3ff",
                textDecoration: "none",
              }}
            >
              TeamScope
            </Link>

            <div style={{ display: "flex", gap: "4px" }}>
              {navigation.map((item) => (
                <NavLink key={item.name} to={item.path}>
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <FaceitAuthButton />

            <Link
              to={
                getPlayerProfileId()
                  ? `/players/${getPlayerProfileId()}`
                  : "/players"
              }
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "rgba(126,212,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  border: "1px solid rgba(126,212,255,0.35)",
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={nickname || "Profile"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      color: "#7ed4ff",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    {nickname ? nickname.slice(0, 2).toUpperCase() : "??"}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

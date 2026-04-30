import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import { DashboardPage } from "@/pages/DashboardPage/DashboardPage";
import { PlayersPage } from "@/pages/PlayersPage/PlayersPage";
import { PlayerProfilePage } from "@/pages/PlayerProfilePage/PlayerProfilePage";
import { TeamPage } from "@/pages/TeamPage/TeamPage";
import { CandidatesPage } from "@/pages/CandidatesPage/CandidatesPage";
import { DemoViewerPage } from "@/pages/DemoViewerPage/DemoViewerPage";
import { MatchDetailsPage } from "@pages/MatchDetailsPage/MatchDetailsPage";
import "./index.css";

// Создаем QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "players", element: <PlayersPage /> },
      { path: "players/:playerId", element: <PlayerProfilePage /> },
      { path: "teams/:teamId", element: <TeamPage /> },
      { path: "teams/:teamId/candidates", element: <CandidatesPage /> },
      { path: "demo/:matchId", element: <DemoViewerPage /> },
      {
        path: "teams/:teamId/matches/:matchId",
        element: <MatchDetailsPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);

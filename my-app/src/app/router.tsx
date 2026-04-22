import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { DashboardPage } from '@pages/DashboardPage/DashboardPage';
import { PlayersPage } from '@pages/PlayersPage/PlayersPage';
import { PlayerProfilePage } from '@pages/PlayerProfilePage/PlayerProfilePage';
import { TeamPage } from '@pages/TeamPage/TeamPage';
import { CandidatesPage } from '@pages/CandidatesPage/CandidatesPage';
import { DemoViewerPage } from '@pages/DemoViewerPage/DemoViewerPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'players',
        element: <PlayersPage />,
      },
      {
        path: 'players/:playerId',
        element: <PlayerProfilePage />,
      },
      {
        path: 'teams/:teamId',
        element: <TeamPage />,
      },
      {
        path: 'teams/:teamId/candidates',
        element: <CandidatesPage />,
      },
      {
        path: 'demo/:matchId',
        element: <DemoViewerPage />,
      },
    ],
  },
]);
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Players', href: '/players' },
  { name: 'Team', href: '/teams/team-1' },
  { name: 'Candidates', href: '/teams/team-1/candidates' },
  { name: 'Demo Viewer', href: '/demo/latest' },
];

export const App: React.FC = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-1 to-bg-2">
      <nav className="border-b border-card-border bg-card/50 backdrop-blur-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link to="/" className="font-exo font-bold text-lg text-text">
                TeamScope
              </Link>
              
              <div className="flex gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      location.pathname === item.href
                        ? 'bg-accent/20 text-accent'
                        : 'text-muted hover:text-text hover:bg-white/5'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">Team: Astralis</span>
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-accent text-sm font-medium">AS</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          
          <main>
            <Outlet />
          </main>
        </div>
      );
    };
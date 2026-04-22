import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link
      to={to}
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 500,
        color: isActive ? '#7ed4ff' : '#afc0d6',
        background: isActive ? 'rgba(126,212,255,0.2)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.15s'
      }}
    >
      {children}
    </Link>
  );
}

export function Layout() {
  const navigation = [
    { name: 'Dashboard', path: '/' },
    { name: 'Players', path: '/players' },
    { name: 'Team', path: '/teams/1' },
    { name: 'Candidates', path: '/teams/1/candidates' },
    { name: 'Demo Viewer', path: '/demo/latest' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(165deg, #07111b, #0d1929)',
      color: '#ecf3ff',
      fontFamily: '"Exo 2", sans-serif'
    }}>
      <nav style={{
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(8,14,23,0.76)',
        backdropFilter: 'blur(3px)',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link to="/" style={{
              fontFamily: '"Exo 2", sans-serif',
              fontWeight: 'bold',
              fontSize: '18px',
              color: '#ecf3ff',
              textDecoration: 'none'
            }}>
              TeamScope
            </Link>
            
            <div style={{ display: 'flex', gap: '4px' }}>
              {navigation.map((item) => (
                <NavLink key={item.name} to={item.path}>
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', color: '#afc0d6' }}>Team: Astralis</span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(126,212,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#7ed4ff', fontSize: '14px', fontWeight: 500 }}>AS</span>
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        <Outlet />
      </main>
    </div>
  );
}
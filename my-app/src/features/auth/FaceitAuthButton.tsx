import React, { useEffect, useState } from 'react';
import {
  buildApiUrl,
  clearAuthTokens,
  fetchMe,
  getAccessToken,
  logoutFaceit,
  saveAuthTokens,
} from '@/shared/auth/FacietAuth';
import './FaceitAuthButton.css';

export const FaceitAuthButton: React.FC = () => {
  const [isAuthed, setIsAuthed] = useState(Boolean(getAccessToken()));
  const [nickname, setNickname] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadMe = async () => {
    if (!getAccessToken()) return;

    try {
      const me = await fetchMe();

      setNickname(
        me?.faceit_nickname ||
          me?.nickname ||
          me?.user?.faceit_nickname ||
          me?.user?.username ||
          'FACEIT',
      );

      setIsAuthed(true);
    } catch {
      clearAuthTokens();
      setIsAuthed(false);
      setNickname('');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const access = params.get('access');
    const refresh = params.get('refresh');
    const playerProfileId = params.get('player_profile_id');

    if (access || refresh) {
      saveAuthTokens({
        access: access || undefined,
        refresh: refresh || undefined,
        player_profile_id: playerProfileId || undefined,
      });

      setIsAuthed(true);

      window.history.replaceState({}, document.title, window.location.pathname);

      void loadMe();
      return;
    }

    void loadMe();
  }, []);

  const handleLogin = () => {
    setLoading(true);

    window.location.href = buildApiUrl('/api/auth/faceit/start');
  };

  const handleLogout = async () => {
    setLoading(true);

    await logoutFaceit();

    setNickname('');
    setIsAuthed(false);
    setLoading(false);
  };

  if (isAuthed) {
    return (
      <button
        type="button"
        className="faceit-auth-btn authed"
        onClick={handleLogout}
        disabled={loading}
      >
        <span className="faceit-dot" />
        {nickname || 'Authorized'}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="faceit-auth-btn"
      onClick={handleLogin}
      disabled={loading}
    >
      {loading ? 'Connecting...' : 'Login with FACEIT'}
    </button>
  );
};
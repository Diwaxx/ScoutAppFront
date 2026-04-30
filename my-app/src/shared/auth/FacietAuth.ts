export const authKeys = {
  access: 'teamscope.access',
  refresh: 'teamscope.refresh',
  playerProfileId: 'teamscope.playerProfileId',
};

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export function getAccessToken() {
  return localStorage.getItem(authKeys.access) || '';
}

export function getRefreshToken() {
  return localStorage.getItem(authKeys.refresh) || '';
}

export function getPlayerProfileId() {
  return localStorage.getItem(authKeys.playerProfileId) || '';
}

export function saveAuthTokens(payload: {
  access?: string;
  refresh?: string;
  player_profile_id?: string;
  playerProfileId?: string;
  user?: {
    player_profile_id?: string;
  };
}) {
  if (payload.access) {
    localStorage.setItem(authKeys.access, payload.access);
  }

  if (payload.refresh) {
    localStorage.setItem(authKeys.refresh, payload.refresh);
  }

  const playerProfileId =
    payload.player_profile_id ||
    payload.playerProfileId ||
    payload.user?.player_profile_id;

  if (playerProfileId) {
    localStorage.setItem(authKeys.playerProfileId, String(playerProfileId));
  }
}

export function clearAuthTokens() {
  localStorage.removeItem(authKeys.access);
  localStorage.removeItem(authKeys.refresh);
  localStorage.removeItem(authKeys.playerProfileId);
}

export function buildApiUrl(path: string) {
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function extractFaceitCode(event: MessageEvent) {
  const data = event.data;

  if (!data) return '';

  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return parsed.code || parsed.authorizationCode || '';
    } catch {
      const match = data.match(/[?&]code=([^&]+)/);
      return match ? decodeURIComponent(match[1]) : '';
    }
  }

  if (typeof data === 'object') {
    return data.code || data.authorizationCode || data.authCode || '';
  }

  return '';
}

export async function exchangeFaceitCode(code: string) {
  const response = await fetch(buildApiUrl('/api/auth/faceit/login'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ code }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || data?.error || 'FACEIT login failed');
  }

  saveAuthTokens(data);
  return data;
}

export async function fetchMe() {
  const access = getAccessToken();

  if (!access) {
    throw new Error('No access token');
  }

  const response = await fetch(buildApiUrl('/api/auth/me'), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${access}`,
    },
    credentials: 'include',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || data?.error || 'Failed to fetch user');
  }

  return data;
}

export async function logoutFaceit() {
  const access = getAccessToken();
  const refresh = getRefreshToken();

  if (refresh) {
    await fetch(buildApiUrl('/api/auth/logout'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ refresh }),
    }).catch(() => null);
  }

  clearAuthTokens();
}
import { clearClientSession } from '../auth';

// Session lifetime synchronizer

export async function syncSessionInterval(): Promise<boolean> {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const res = await fetch('http://localhost:8888/api/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.result?.token) {
        localStorage.setItem('token', data.result.token);
        document.cookie = `token=${data.result.token}; path=/; max-age=86400; SameSite=Lax`;
        console.log('[SESSION SYNC] Token successfully rotated.');
        return true;
      }
    }
  } catch (error) {
    console.error('[SESSION SYNC] Network error during token rotation:', error);
  }

  // If refresh fails, clear session
  clearClientSession();
  return false;
}

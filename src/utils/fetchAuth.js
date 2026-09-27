// Archivo: src/utils/fetchAuth.js
// Wrapper de fetch que detecta tokens expirados (401), renueva automáticamente
// con el Refresh Token de 15 días, y auto-desloguea solo si el refresh falla.

import { API_URL } from '../config/api';

let refreshPromise = null;

function handleSessionExpired() {
  console.warn('[fetchAuth] Sesión expirada o refresh token inválido. Cerrando sesión.');
  localStorage.removeItem('spingamma_user');
  localStorage.removeItem('spingamma_token');
  localStorage.removeItem('spingamma_refresh_token');

  // Redirigir al home solo si no estamos ya ahí (evita loops)
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  } else {
    window.location.reload();
  }
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('spingamma_refresh_token');
  if (!refreshToken) {
    throw new Error('NO_REFRESH_TOKEN');
  }

  // Mutex para peticiones concurrentes: si ya hay un refresh en curso, esperamos a que termine
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!res.ok) {
          throw new Error(`REFRESH_FAILED_${res.status}`);
        }

        const data = await res.json();
        if (!data.access_token) {
          throw new Error('INVALID_REFRESH_RESPONSE');
        }

        localStorage.setItem('spingamma_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('spingamma_refresh_token', data.refresh_token);
        }

        return data.access_token;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export default async function fetchAuth(url, options = {}) {
  let token = localStorage.getItem('spingamma_token');

  // Clonar options para evitar mutar el objeto original del llamador
  const requestOptions = {
    ...options,
    headers: {
      ...(options.headers || {})
    }
  };

  // Inyectar Authorization si hay token y no se proporcionó manualmente
  if (token && !requestOptions.headers.Authorization && !requestOptions.headers.authorization) {
    requestOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, requestOptions);

  // Si el backend responde 401 y no es una llamada directa de refresh o login
  const isAuthEndpoint = typeof url === 'string' && (
    url.includes('/auth/refresh') || url.includes('/auth/google') || url.includes('/auth/e2e-login')
  );
  
  if (res.status === 401 && !isAuthEndpoint) {
    try {
      // Intentar refrescar la sesión en silencio
      const newAccessToken = await refreshAccessToken();

      // Reintentar la petición original con el nuevo token
      requestOptions.headers['Authorization'] = `Bearer ${newAccessToken}`;
      const retryRes = await fetch(url, requestOptions);

      // Si aún tras refrescar responde 401, entonces la sesión expiró definitivamente
      if (retryRes.status === 401) {
        handleSessionExpired();
        throw new Error('SESSION_EXPIRED');
      }

      return retryRes;
    } catch (err) {
      handleSessionExpired();
      throw new Error('SESSION_EXPIRED');
    }
  }

  return res;
}


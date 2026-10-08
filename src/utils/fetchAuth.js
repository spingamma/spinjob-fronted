// Archivo: src/utils/fetchAuth.js
// Wrapper de fetch que detecta tokens expirados (401), renueva automáticamente
// con el Refresh Token de 15 días, y auto-desloguea solo si el refresh falla.

import { API_URL } from '../config/api';

let refreshPromise = null;

function handleSessionExpired() {
  console.warn('[fetchAuth] Sesión expirada o refresh token inválido. Cerrando sesión.');
  
  // Guardar la URL actual para redirigir al usuario tras volver a iniciar sesión
  try {
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath && currentPath !== '/' && !currentPath.includes('/login')) {
      sessionStorage.setItem('redirect_after_login', currentPath);
    }
  } catch {
    // ignore
  }

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
    const err = new Error('NO_REFRESH_TOKEN');
    err.status = 401;
    throw err;
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
          const err = new Error(`REFRESH_FAILED_${res.status}`);
          err.status = res.status;
          throw err;
        }

        const data = await res.json();
        if (!data.access_token) {
          const err = new Error('INVALID_REFRESH_RESPONSE');
          err.status = 500;
          throw err;
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

      // Si aún tras refrescar responde 401, el token nuevo no tiene acceso
      if (retryRes.status === 401) {
        handleSessionExpired();
        throw new Error('SESSION_EXPIRED');
      }

      return retryRes;
    } catch (err) {
      // 🚨 BLINDAJE CONTRA DESLOGUEOS EN DEPLOYS / REINICIOS DEL SERVIDOR:
      // Solo deslogueamos si el refresh endpoint respondió 401 explícito o no existe refresh token.
      if (err?.status === 401 || err?.message === 'NO_REFRESH_TOKEN') {
        handleSessionExpired();
        throw new Error('SESSION_EXPIRED');
      }

      // Si fue una falla de red (Failed to fetch), 502 Bad Gateway o 503 (servidor reiniciándose):
      // ¡NO cerrar sesión! Preservamos el refresh token de 15 días para no expulsar al usuario.
      console.warn('[fetchAuth] Servidor temporalmente no disponible (posible deploy en curso). Preservando sesión del usuario:', err?.message || err);
      return res;
    }
  }

  return res;
}


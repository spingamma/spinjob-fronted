// Archivo: src/utils/fetchAuth.js
// Wrapper de fetch que detecta tokens expirados (401) y auto-desloguea al usuario.

export default async function fetchAuth(url, options = {}) {
  const token = localStorage.getItem('spingamma_token');

  // Inyectar Authorization si hay token y no se proporcionó manualmente
  if (token && !options.headers?.Authorization) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  const res = await fetch(url, options);

  // Si el backend responde 401, el token expiró o es inválido
  if (res.status === 401) {
    console.warn('[fetchAuth] Token expirado o inválido. Cerrando sesión automáticamente.');
    localStorage.removeItem('spingamma_user');
    localStorage.removeItem('spingamma_token');

    // Redirigir al home solo si no estamos ya ahí (evita loops)
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    } else {
      window.location.reload();
    }

    // Lanzar un error controlado para que el caller no procese la respuesta
    throw new Error('SESSION_EXPIRED');
  }

  return res;
}

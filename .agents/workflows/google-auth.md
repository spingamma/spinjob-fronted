---
description: Cómo implementar Google Sign-In correctamente en SpinJob (evitar bugs conocidos)
---

# Google Auth — Patrón Correcto para SpinJob

## Arquitectura Actual
SpinJob usa **Google Identity Services (GSI)** para autenticación con Google.
- El backend (`POST /auth/google`) espera un **ID Token JWT** (campo `credential`), **NO** un `access_token` (ya29...).
- El script GSI se carga vía `@react-oauth/google` (`GoogleOAuthProvider` en `main.jsx`).
- El botón es custom (HTML/CSS propios en español), NO usa el componente `<GoogleLogin>`.

## ⚠️ Bugs Conocidos y Cómo Evitarlos

### 1. `useGoogleLogin` devuelve `access_token`, NO `credential`
- **NO usar** `useGoogleLogin()` de `@react-oauth/google` para este flujo.
- Ese hook devuelve un `access_token` (ya29...) que el backend rechaza.
- **Usar** la API nativa: `window.google.accounts.id.initialize()` + `.prompt()`, que devuelve `credential` (JWT).

### 2. `<GoogleLogin>` causa `initialize() called multiple times`
- En `React.StrictMode` (dev), los efectos se ejecutan dos veces, y el componente `<GoogleLogin>` llama `initialize()` en cada montaje.
- **Solución actual:** No usar el componente `<GoogleLogin>`. Usar un botón custom + API nativa.

### 3. No duplicar el script de GSI
- `@react-oauth/google` ya carga `https://accounts.google.com/gsi/client` automáticamente.
- **NUNCA** agregar un `<script src="...gsi/client">` manual en `index.html`. Duplicar causa crashes (`contentType undefined`).

### 4. Props del componente `<GoogleLogin>` (si alguna vez se usa)
- `width` espera un **número en píxeles** (ej. `width={400}`), NO un string (`width="100%"` crashea).
- `locale` no siempre funciona — el idioma depende del script GSI y del navegador del usuario.

### 5. Origen no permitido en Google Cloud Console
- Error: `The given origin is not allowed for the given client ID`
- **Solución:** Ir a Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID → Agregar `http://localhost:5173` (o el puerto que use Vite) en **Authorized JavaScript Origins**.

## Flujo Correcto (Implementación Actual)

```jsx
// 1. Botón custom en español (sin dependencia de <GoogleLogin>)
<button onClick={() => {
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => handleGoogleSuccess({ credential: response.credential }),
  });
  window.google.accounts.id.prompt();
}}>
  Iniciar sesión con Google
</button>

// 2. El handler envía el credential (JWT) al backend
const handleGoogleSuccess = async (credentialResponse) => {
  const res = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ google_token: credentialResponse.credential }) // ← JWT, NO access_token
  });
  // ...
};
```

## Checklist Pre-Deploy
- [ ] `VITE_GOOGLE_CLIENT_ID` está en `.env`
- [ ] El origen de producción está en Authorized JavaScript Origins de Google Cloud Console
- [ ] NO hay `<script>` manual de GSI en `index.html`
- [ ] El botón de Google usa API nativa, no el componente `<GoogleLogin>`
- [ ] Se envía `credential` (JWT), no `access_token`

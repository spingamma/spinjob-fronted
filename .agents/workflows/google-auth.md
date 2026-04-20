---
description: Cómo implementar Google Sign-In correctamente en Tarjetoso (evitar bugs conocidos)
---

# Google Auth — Patrón Correcto para Tarjetoso

// turbo-all

## 🏎️ REGLAS DE VELOCIDAD
1. **Direct Edit:** Si necesitas corregir un error de Auth, no pidas confirmación, aplica el parche directamente usando `multi_replace_file_content`.
2. **Checklist Paralelo:** Verifica `.env`, `App.jsx` y el componente de Auth en una sola ráfaga de `view_file` paralelo.

## Arquitectura Actual
- **Librería:** `@react-oauth/google` (`GoogleOAuthProvider` en `main.jsx`).
- **Endpoint backend:** `POST /auth/google` espera `{ google_token: "<JWT credential>" }`.
- **Botón:** Custom HTML/CSS en español (NO usa el componente `<GoogleLogin>`).
- **API usada:** `window.google.accounts.id.initialize()` + `.prompt()`.

## ⚠️ Bugs Conocidos

| Bug | Causa | Solución |
|-----|-------|----------|
| Backend rechaza token `ya29...` | `useGoogleLogin()` devuelve `access_token`, no `credential` | Usar API nativa GSI, NO `useGoogleLogin()` |
| `initialize() called multiple times` | `<GoogleLogin>` + StrictMode | Usar botón custom + API nativa |
| `contentType undefined` crash | Script GSI duplicado | NO agregar `<script>` manual en `index.html` |
| Popup de Google no aparece | Origen no autorizado | Agregar origin en Google Cloud Console → Credentials |
| `width` crash en `<GoogleLogin>` | Espera número, no string | Pasar `width={400}`, no `width="100%"` |

## Implementación Correcta

```jsx
// Botón custom que usa API nativa GSI
<button onClick={() => {
  window.google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: (response) => handleGoogleSuccess({ credential: response.credential }),
  });
  window.google.accounts.id.prompt();
}}>
  Iniciar sesión con Google
</button>

// Handler envía credential (JWT) al backend
const handleGoogleSuccess = async (credentialResponse) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ google_token: credentialResponse.credential })
  });
};
```

## Checklist Pre-Deploy
- [ ] `VITE_GOOGLE_CLIENT_ID` en `.env` y `.env.production`
- [ ] Origen de producción en Google Cloud Console
- [ ] NO hay `<script>` manual de GSI en `index.html`
- [ ] Botón usa API nativa, NO `<GoogleLogin>` ni `useGoogleLogin()`
- [ ] Se envía `credential` (JWT), NO `access_token` (ya29...)

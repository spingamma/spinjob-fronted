---
description: Verificación rápida del frontend — Revisa build, imports y estructura antes de deploy a Vercel.
---

# Workflow: Verificar Frontend (/verificar-frontend)

// turbo-all

Ejecuta esta checklist antes de hacer deploy o al terminar un feature.

## 1. Build limpio

```
cd c:\Users\jhona\Desktop\spinjob-fronted && npm run build
```

Si hay errores de compilación (imports rotos, JSX inválido, variables no definidas), corrígelos antes de continuar.

## 2. Verificar rutas en App.jsx

Abre `src/App.jsx` y confirma que:
- Todas las pages tienen lazy import
- Todas las rutas tienen su `<Route>` correspondiente
- No hay rutas duplicadas ni huérfanas

## 3. Verificar variables de entorno

Abre `.env` y confirma que existen:
- `VITE_API_URL` — URL base del backend
- `VITE_GOOGLE_CLIENT_ID` — Client ID de Google OAuth

Si alguna falta o tiene valor placeholder, reportar al usuario.

## 4. Verificar PWA manifest

Abre `vite.config.js` y confirma que `VitePWA.manifest` tiene:
- `name` y `short_name` correctos (deben decir "Tarjetoso", NO "SpinJob")
- `icons` apuntando a archivos que existen en `public/`
- `theme_color` y `background_color` definidos

## 5. Buscar referencias a marca antigua

```
cd c:\Users\jhona\Desktop\spinjob-fronted && npx -y grep -ri "spinjob" src/ --include="*.jsx" --include="*.js"
```

Si aparecen resultados, reemplazar por "Tarjetoso".

## 6. Verificar que no hay God Components

```
cd c:\Users\jhona\Desktop\spinjob-fronted && powershell -Command "Get-ChildItem -Recurse src -Include *.jsx,*.js | Where-Object { (Get-Content $_.FullName | Measure-Object -Line).Lines -gt 400 } | ForEach-Object { Write-Output \"$($_.FullName): $((Get-Content $_.FullName | Measure-Object -Line).Lines) líneas\" }"
```

Si aparecen archivos con más de 400 líneas, considerar refactorizarlos.

## 7. Verificar dev server

```
cd c:\Users\jhona\Desktop\spinjob-fronted && npm run dev
```

Si el servidor arranca sin warnings críticos, la verificación pasó.

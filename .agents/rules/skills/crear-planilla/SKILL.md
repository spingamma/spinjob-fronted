---
trigger: always_on
---

---
name: crear-plantilla
description: Genera una nueva plantilla de perfil profesional (ej. Médico, Abogado) basada en los estándares de diseño premium de SpinGamma. Úsala cuando el usuario pida una nueva profesión.
---

# Skill: Crear Plantilla Profesional

## Pasos a seguir:
1. Clona la estructura base de `PlantillaGenerica.jsx`.
2. Aplica las reglas del Diseñador UI (Glassmorphism, Tailwind).
3. Asegúrate de recibir `profesional`, `volverAtras`, y `onProtectedAction` como props.
4. Conecta correctamente el botón de "Calificar" para que respete el AuthModal si no hay sesión.
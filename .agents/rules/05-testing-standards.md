# Testing Standards y E2E (End-to-End)

Estas reglas dictan los estándares de automatización y mockeo de datos para asegurar fidelidad durante las pruebas.

## 1. Paridad Estricta en Fixtures de Sesión (E2E Mocking Parity)
🚨 **CRÍTICO:** Cuando se implementen estrategias de "Shift-Left Testing" inyectando estados de sesión (vía almacenamiento local, cookies o estado global de la aplicación) para evadir procesos de login, el payload inyectado **DEBE** poseer paridad estructural exacta con la respuesta genuina de la API de autenticación.

- **Integridad de Payload:** Se prohíbe crear fixtures de "usuario falso" que omitan campos que el frontend utiliza activamente para verificaciones (ej. `id`, `role`, tokens de sesión).
- **Prevención de Falsos Negativos:** Omitir identificadores en los tests causará que la capa de UI aplique fallbacks de "usuario no autorizado" y evalúe flujos falsos, desviando el objetivo principal de la prueba.
- Siempre basa la inyección en un esquema validado.

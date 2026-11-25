# Combate común y encuentro de la caverna

Implementación incremental sobre Phaser 3, sin motor por filósofo. El modelo de salud, impactos, proyectiles y comportamiento está en `src/gameplay/combat.ts`; la presentación y entrada en `src/gameplay/phaser/combat.ts`. Reutiliza la cinemática de proyectiles existente. La linterna sigue siendo equipamiento de exploración y no hace daño.

## Datos y autoría

Cada interior puede contener `encounters`: identidad permanente, recurso, identidad opcional del interlocutor para anclar el bocadillo, posición, zona, escala, vida, comportamiento estático/patrulla/persecución, hitboxes, ataque de contacto/proyectil/ninguno, parámetros de Sofía, diálogos, condiciones, checkpoint, evento y recompensa. `parseWorld` valida referencias, límites y parámetros. Mundos y escenarios incorpora el inspector «Encuentros · Combate común». Los parámetros adicionales se pueden intercambiar en JSON validado; no es necesario cambiar el motor.

F y el botón Pulso atacan en la dirección de Sofía. El control solo aparece durante un combate activo. Menús, diálogos y edición congelan el encuentro. Un proyectil impacta una vez; al vencer, perder o salir se limpia. El reintento restaura ambos actores y conserva lo aprendido. Se persisten estado y número de reintentos; un combate activo recargado vuelve a su checkpoint. La victoria y su recompensa se registran una sola vez.

## Platón

El encuentro de C usa `public/worlds/plato-combat.json`. El encapuchado habla antes de atacar; tres impactos lo hacen desvanecerse y habilitan fuego, figuras y explicación de las sombras. No concede pergamino ni abre el portal final. Se conservan regreso a B, liberación, dos ascensos y desenlaces. Las partidas que ya investigaron o liberaron al prisionero no se bloquean retroactivamente.

**Dependencias:** el desafío visual previo del prisionero todavía no está implementado; temporalmente se exige completar su conversación (`prisionero_escuchado`), requisito editable en datos. Las pruebas ERCA finales del diseño rector tampoco se implementan en esta tarea. El encapuchado es ficción didáctica de esta adaptación, no un personaje del texto de Platón.

**Arte provisional:** se reutiliza `cave-warden.png`; el pulso y las esferas son efectos simples reemplazables. No se ha creado una animación nueva de ataque de Sofía. No presentar estos recursos como arte definitivo.

## Laboratorio

Playground → Combate común prueba dos instancias del mismo controlador: encapuchado y vasija provisional. Configuración en `public/presets/combat-lab.json`. No escribe partidas; al cambiar de modalidad destruye enemigos y proyectiles.

## Validación

Pruebas puras en `tests/combat.test.mjs`; recorrido de navegador en `tests/browser_combat.py`. Los resultados finales y limitaciones de la sesión se registran al terminar las comprobaciones. El toque emulado no equivale a una prueba en teléfono físico.


### Resultados comprobados — 25 de noviembre de 2026

- `npm test`: 134 pruebas aprobadas, cero fallos. Incluye cadencia, impacto único, pausa, invulnerabilidad, derrota, reinicio del modelo, límites, referencias, migración, etapas de búsqueda y ambos desenlaces anteriores de la caverna.
- Chrome con perfiles aislados: diálogo previo sin daño, derrota real por esferas, reintento con vida restaurada, pausa del inventario, victoria con teclado, conservación tras recargar, regreso B–C sin repetir el encuentro y limpieza de proyectiles comprobados.
- Toque emulado horizontal: mismo ciclo de combate, ataque táctil y persistencia comprobados. Dos apariencias del laboratorio y campos del inspector comprobados, sin errores de JavaScript registrados.
- `tests/browser_plato_search.py`: recorrido completo aprobado en escritorio, incluyendo vuelo con movimiento reducido, animación de recogida con movimiento normal, inventario, permiso de Platón, entrada a B con luz y recarga. Con toque emulado se comprobó la continuación posterior a la recogida: inventario, permiso y entrada iluminada.
- No se ha probado un teléfono físico. Los recursos de enemigo y pulso siguen siendo provisionales; no existe animación nueva de ataque.

### Módulos principales modificados

| Área | Archivos |
| --- | --- |
| Modelo y presentación | `src/gameplay/combat.ts`, `src/gameplay/phaser/combat.ts`, `src/gameplay/phaser/combat.css` |
| Integración, controles y guardado | `src/main.ts`, `src/engine/universe.ts`, `src/engine/progression.ts`, `src/engine/exploration-controls.ts` |
| Contrato y compatibilidad | `src/worlds/schema.ts`, `src/worlds/combat-compatibility.ts`, `src/worlds/scene-dialogues.ts`, `src/worlds/story-events.ts`, `src/worlds/story-studio.ts` |
| Editor | `src/engine/combat-editor.ts`, `src/engine/core-workbench.ts` |
| Contenido y laboratorio | `public/worlds/plato.json`, `public/worlds/plato-combat.json`, `public/presets/combat-lab.json`, `src/playground-mecanicas/`, `playground.html` |
| Pruebas | `tests/combat.test.mjs`, `tests/browser_combat.py`, `tests/plato-adventure.test.mjs`, `tests/mechanics-playground.test.mjs` |

Comandos de navegador: `npm run test:combat` y `npm run test:plato-search`. Por defecto esperan el servidor en 4173; `SOFIA_URL` permite probar otra URL. Los informes y capturas locales se guardan en `captures/` (no se versionan).

Comprobación final: `npm run check`, `npm test` (134/134), `npm run build` y `tests/browser_combat.py` completo (escritorio, toque emulado, laboratorio e inspector) aprobados. Se comprobó también la identidad del encapuchado usada por el anclaje de los bocadillos. Vite conserva el aviso de tamaño del paquete compartido de Phaser; no hubo errores de compilación.

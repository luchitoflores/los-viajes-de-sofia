# Mundos editables en GDevelop — 26 de noviembre de 2026

La plantilla autónoma se amplía con el flujo del juego existente. Phaser continúa siendo el juego principal; su editor y sus partidas se conservan.

## Proyecto

- Fuente versionada: `public/lab/gdevelop/game.json`, con sus carpetas de recursos.
- Copia de trabajo local: `../sofia_gdevelop_autonomia/game.json`.
- Manual de autor: `public/lab/gdevelop/LEEME.md`.
- Los eventos externos `SofiaKit` y `SofiaUniverso` comparten el comportamiento entre escenas. Las apariciones son objetos nativos, con variables, recursos y salud editables en GDevelop. Los textos son recursos Yarn.

## Incorporado

- Siete superficies: Tierra, Platón, Sartre, Camus, Hegel, Kant y Heidegger; los cuatro últimos conservan el arte provisional de las pruebas del motor.
- 26 escenas nativas en total, incluyendo interiores existentes y los ejercicios previos de la plantilla. Agrupadas por mundo en el administrador de escenas.
- Recorrido circular, posición radial de NPC/entradas, obstáculos y navegación al tocar; teclado alternativo.
- Nave compartida: selección de destino, despegue, sobrevuelo de planetas intermedios según `Orden`, descenso y desembarque. Adaptación a GDevelop con arte del juego; no ejecución del código de Phaser.
- Interiores con zonas invisibles de suelo, obstáculos, pendiente/escalera, pasos caminando, entradas y portales. `Destino`, `LlegadaX`, requisitos y bloqueo se editan en variables nativas.
- Conversaciones importadas a Yarn: 206 nodos contando turnos y ramas auxiliares que conservan enlaces/recompensas. Entradas condicionadas, eventos narrativos y compañero usan datos comunes.
- Agacharse con fotogramas existentes de Sofía, hitbox más baja, pulso desde el emisor, salud, impactos visibles y barra del enemigo. La linterna es independiente del ataque. El arte del emisor y proyectil es provisional y reutiliza energía azul del portal; no se ha dibujado una animación nueva de disparo.
- Guardado propio, inventario y reintento de combate, independientes de las partidas de Phaser.

## Validación y límites

Exportado con GDevelop 5.6.287. Recorrido con clic real y toque horizontal emulado: vuelta circular, Tierra→Sartre sobre Platón, regreso en sentido contrario, conversación en superficie, entrada/salida de caverna, linterna, agacharse para evitar proyectiles y victoria con daño real. Sin teléfono físico.

Pruebas adicionales por vista previa con progreso preparado: caminar por las pendientes del ascenso, obtener la recompensa del segundo ascenso y usar el portal a la superficie. También se exportó y ejecutó una copia de Tierra llamada `MiPlaneta` sin modificar los eventos compartidos. Phaser: 136 pruebas correctas, TypeScript y Vite compilados.

Regresión reproducible: `tests/browser_gdevelop_worlds.py`, con Playwright/Chrome. Definir `GDEVELOP_EXPORT_DIR` apuntando a una exportación HTML5 de esta plantilla, o `GDEVELOP_URL` para una exportación servida. Usa perfiles de navegador aislados; no modifica las partidas del autor. El informe del recorrido está en `public/lab/gdevelop/VALIDACION.json`.

La importación no equivale a una migración total del producto: quedan fuera los minijuegos HTML, el editor Phaser, sus guardados/borradores locales, modos Historia/Libre, atlas y colecciones. Las actividades no implementadas indican que están pendientes. La aventura completa de Platón, con todas sus decisiones y misiones, necesita validación de extremo a extremo; las pruebas de escena con progreso preparado no sustituyen ese recorrido.

Duplicar un mundo crea otra escena con `Modo=superficie`; cambiar `Superficie`, `Titulo`, `Orden` y su imagen. La nave descubre las superficies por datos. Las ilustraciones de sobrevuelo se configuran en objetos nativos `Tipo=sobrevuelo`, `Mundo=nombre de escena`. Las nuevas apariciones persistentes necesitan IDs propios.

Las cadenas avanzadas `Acciones`, las variantes y reglas importadas siguen siendo datos JSON en variables: no se presenta esto como un editor visual completo de acontecimientos. Los caminos y conexiones sencillas sí tienen campos individuales. No ejecutar los generadores de la comparación sobre cambios hechos por el autor.

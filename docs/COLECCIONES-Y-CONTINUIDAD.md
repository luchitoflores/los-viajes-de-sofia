# Colecciones, continuidad y regreso al juego

Actualización: 24 de noviembre de 2026.

## Pergaminos y filósofos

El botón **Pergaminos** reúne los descubrimientos de los mundos de la partida activa. Completar `aventura_platon_completada` concede `pergamino-platon`, con un apartado sobre el mito de la caverna: apariencia, investigación de las causas, dificultad del aprendizaje y regreso para dialogar. Es una recreación didáctica, no una cita de Platón.

`knowledgeScrolls` define pergaminos con apartados e identificadores permanentes. Cada apartado tiene texto y condiciones `requires`/`excludes`. Otra misión puede desbloquear otro apartado del mismo pergamino; no hace falta entregar un objeto duplicado. `grantKnowledge` es idempotente y recupera el premio en partidas anteriores que ya tienen la misión cumplida.

**Filósofos** muestra la colección de toda la partida: retratos de autores cuya presentación se completó, fichas de vida, obras y pensamiento, e incógnitas para los demás. Conserva las memorias de encuentros antiguas. Historia y Libre siguen teniendo progresos independientes.

Los datos de Platón están incluidos en su mundo; `public/collections.json` aporta también las fichas de Platón y Sartre a borradores anteriores sin reemplazar los textos que el autor haya editado. Las definiciones enriquecidas se incluyen al exportar el proyecto. Los demás autores conservan su resumen y señalan si falta ampliar su ficha; no se presentan biografías inventadas como contenido terminado.

Fuentes de los resúmenes originales en español: [Platón, Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/entries/plato/), [Sartre, Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/entries/sartre/). Las fichas son paráfrasis breves y editables.

## Movimiento, luz y suelo

- Las llegadas laterales guardan orientación. Entrar desde la izquierda mira a la derecha y viceversa; se aplica al compañero.
- La animación común de nave recorre el orden de Tierra y la ruta de Historia; el regreso invierte su sentido.
- La linterna empieza apagada cuando aún no hay una elección guardada. Su disponibilidad se configura por escenas; actualmente se limita a la caverna. `lampara_encendida` sigue siendo el hito narrativo de adquisición y no se borra al apagarla. Los estados explícitos guardados se conservan.
- Salto opcional en interiores: Espacio, flecha arriba o W; doble toque en suelo vacío o gesto vertical hacia arriba. Cancela el destino pendiente para que una investigación en espera no bloquee el salto. Las superficies radiales no saltan. El playground mantiene visibles las capacidades deshabilitadas y explica su estado.
- Y=560 sigue siendo el valor por defecto de interiores nuevos, no un límite obligatorio. **Suelo físico** desplaza el apoyo principal, sus objetos y entradas; los descansos superiores se conservan. **Suelo dibujado** ajusta la imagen independientemente. No se detecta geometría a partir de píxeles.

## Portal y recurso gráfico

La salida E utiliza el mismo objeto y requisito existentes, con un portal azul ovalado. Permanece tenue antes de completar la aventura y se ilumina/anima al habilitarse. Conduce a superficie, no sustituye los viajes en nave. El recurso `public/assets/cave-prisoners/surface-portal-blue.png` tiene cuatro fotogramas en rejilla 2×2 y transparencia; el motor reproduce la secuencia mediante metadatos de animación.

Prompt de generación (herramienta gráfica de IA): crear una hoja de sprites de cuatro fotogramas de un portal ovalado vertical, como espejo de galaxia azul/cian, borde luminoso, interior estrellado en suave movimiento; estilo ilustrado coherente con la caverna de Sofía, sin personajes, texto ni escenario; rejilla 2×2 con igual tamaño y apoyo inferior, fondo transparente. La reproducción es por fotogramas; no se presenta una imagen estática como una animación de Sofía.

## Cerrar editor

**Cerrar editor** vuelve al juego. Si no hay cambios no pregunta ni recarga la página. Si hay modificaciones ofrece guardar y volver, descartar y volver o seguir editando. Descartar restaura únicamente los borradores modificados en esa sesión, además de configuración y catálogos. La partida jugada se conserva y se restaura su posición. Guardar conserva los diseños y reconstruye la escena cuando es necesario; no recarga todo el navegador.

Pruebas: `tests/travel-knowledge-floor.test.mjs` y `tests/browser_travel_collections.py`. Las pruebas de navegador usan perfiles aislados; no equivalen a una prueba en teléfono físico.

## Validación de esta entrega

- `npm test`: 119 pruebas aprobadas.
- `npm run build`: TypeScript y Vite aprobados.
- `browser_travel_collections.py`: recuperación de pergamino, Platón y Sartre conocidos, incógnitas, salto con teclado, portal habilitado, cierre limpio sin recarga, descarte, guardado del formulario pendiente, suelo Y=685 y salto con gesto táctil horizontal.
- `browser_plato_adventure.py`: cinco habitaciones, investigación, liberación, seguimiento por escaleras, primer ascenso, regreso obligatorio y ambos desenlaces con segundo ascenso; sin errores de navegador.
- Las pruebas usan perfiles aislados. No se probó en un teléfono físico.

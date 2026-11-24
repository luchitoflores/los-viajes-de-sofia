# Sofía y los mundos de las ideas · Planeta de la Polis



Implementación jugable en **Phaser 3.90.0, TypeScript estricto y Vite**. El motor se empaqueta desde npm: ya no depende de un script de CDN. Las ediciones Canvas de `public/offline.html` y `public/offline-src/` se conservan; no son la implementación radial.



## Ejecutar



Desde esta carpeta:



```sh

npm ci

npm run dev

```



Abre la URL de Vite, normalmente `http://localhost:5173`. No abras `index.html` mediante `file://`: es una entrada TypeScript para Vite.



```sh

npm run check

npm run build

npm run preview

npm test

```



Las pruebas de modelo usan el soporte TypeScript de Node 22.6 o posterior. La validación se ejecutó con Node 24. `compile:standalone` se mantiene como alias de la compilación Vite; `dist/` contiene el motor y los recursos locales y debe servirse por HTTP.



## Explorar



- Toca o haz clic en el lugar al que quieres ir. Sofía camina y se detiene allí.

- Toca un objeto, personaje o puerta: Sofía se acerca e interactúa al llegar. No hay botón Acción ni salto.

- En pantallas táctiles hay un joystick analógico discreto como alternativa. Las flechas de teclado o A/D y E se conservan como alternativa accesible.

- **Vista** o rueda: seguimiento cercano o planeta completo. Puedes continuar caminando en ambos modos.

- La nave abre la galaxia existente.

- El templo y la puerta de la casa conectan con la biblioteca. La caverna conecta con el recorrido lateral original de Platón.

- La puerta de salida del interior y **Salir a la Polis** devuelven a Sofía al punto guardado. La caverna también conserva ese anclaje entre sus cámaras.



Nave junto a la zona de aterrizaje; Sócrates en el ágora superior; templo hacia el olivar; casa y caverna en sectores separados. La colocación inicial es deliberada, no aleatoria.



## Física y cámara



`src/planet-model.ts` contiene la mecánica independiente del render. Un ángulo continuo en radianes y una altura radial sitúan los pies de Sofía en coordenadas de mundo. El ángulo no se reinicia al cruzar 0°. La velocidad tangencial se convierte en desplazamiento angular según el radio actual; la gravedad mantiene a Sofía apoyada en la superficie. El integrador conserva capacidad de salto para las pruebas de física, pero no se expone como control de exploración. La integración usa subpasos de hasta 1/120 s.



El suelo circular tiene radio 500. Los sólidos configurables usan intervalos tangenciales y alturas radiales: bloquean el paso y permiten aterrizar sobre ellos. El sprite se orienta según la normal local y la cámara compensa suavemente esa orientación, dejando espacio sobre el terreno.



**La imagen del terreno no gira.** Sofía cambia de coordenadas alrededor del centro y los objetos conservan sus posiciones de mundo. La cámara produce la sensación de que el pequeño mundo pasa bajo sus pies.



Las colisiones de los objetos son envolventes radiales configurables, no contornos extraídos automáticamente del PNG. Edificios y árboles iniciales son decorado de fondo atravesable; puedes convertirlos en sólidos en el editor. Los gráficos de diagnóstico solo aparecen al editar.



## Editor radial



Abre el editor desde la barra superior estando en la Polis.



1. Arrastra una ilustración de la biblioteca con ratón o dedo hasta el borde. Se detecta la superficie, se calcula el ángulo y se ajusta el apoyo a altura cero.

2. Arrastra un objeto existente alrededor de la superficie. Se conserva su altura manual.

3. Edita **ángulo en grados, altura radial, tamaño, giro local, reflejo, nombre, interacción, destino, colisión y dimensiones de la zona invisible**.

4. Interacciones disponibles: Decoración, Conversación, Coleccionable, Entrar y Galaxia. Ajusta ancho y alto del sólido cuando corresponda.

5. Guarda, deshaz, elimina o exporta JSON. **Probar mundo** devuelve el control a Sofía.



El formato exportado es `sofia-radial-planet`, versión 1. La importación valida tipos, límites numéricos, identificadores únicos, interacciones y destinos antes de cambiar el mundo. Un archivo inválido no sustituye el diseño actual. El editor lateral anterior sigue disponible en sus escenas.



## Guardado



- `sofia-polis-radial-v1`: ángulo, objetos recogidos, descubrimientos, diseño y anclaje de regreso.

- `sofia_phaser_real_v02`: progreso y editor lateral anteriores, ampliados con Polis y Biblioteca.



Se guarda al interactuar, editar, cambiar de escena y abandonar la página; durante el paseo también hay guardado periódico. La partida reside en este navegador. El JSON exporta el diseño, no la partida completa.



## Archivos



- `src/main.ts`: integración con escenas, controles, álbum y editor existentes; biblioteca parallax y puertas de retorno.

- `src/planet-model.ts`: posiciones polares, gravedad, salto, colisiones, datos y validación.

- `src/planet-scene.ts`: escena Phaser, cámara, sprites, interacciones y editor radial.

- `public/assets/planet-terrain.png` y `public/assets/polis-*.png`: recursos ilustrados independientes.

- `ASSET-PROMPTS.md`: procedencia y prompts de generación.

- `tests/planet-model.test.mjs`: pruebas automáticas del modelo.

- `tests/browser_planet.py`: prueba integral en Chrome/Playwright.

- `captures/validation.json`: resultados medidos en navegador.

- `captures/polis-cercana.png`, `polis-completa.png`, `editor-radial.png`, `interior-entrance.png`, `interior-library.png`: capturas del render real.



## Repetir la prueba en navegador



Con Vite ejecutándose, instala Playwright para Python si no lo tienes y ejecuta:



```sh

python -m pip install playwright

npm run test:browser

```



El guion usa Chrome en su ruta habitual de Windows y un contexto aislado; no borra la partida de tu navegador personal. `SOFIA_URL` permite probar otra URL.



Comprueba más de 360° en ambos sentidos mediante teclado, ausencia de salto al pulsar Espacio, conversación, recogida, entrada y salida de ambos interiores con posición exacta, vista completa, terreno sin rotación artificial, arrastre de biblioteca y objetos, gestos táctiles mediante CDP, propiedades, exportación, importación, deshacer y guardado tras recarga. El toque se emula en Chrome; no sustituye la prueba en un teléfono físico.



Cámara y conversión de punteros: [API oficial de Phaser 3.90, BaseCamera](https://docs.phaser.io/api-documentation/3.90.0/class/cameras-scene2d-basecamera).



La compilación de producción también se verificó en navegador con `tests/capture_final.py`: render cercano, vista completa, editor con propiedades, vista móvil y eliminación de la colisión al recoger un objeto sólido. Las capturas finales corresponden a esa compilación.



Actualización visual y compañero: consulta `VISUAL-UPDATE.md` y `ASSET-PROMPTS-V2.md`. El recorrido inspirado en el Genially se verifica con `npm run test:story`.





Controles por toque y decisiones del autor: `../AGENTS.md` y `TOUCH-CONTROLS.md`. Verificación: `npm run test:taps`.





## Motor común y caso de Sartre



El botón Mundos abre el universo por épocas. Ruta del caso funcional: **Contemporánea → Existencialismo (o Fenomenología) → Jean-Paul Sartre**. Ambas corrientes conducen al mismo planeta y progreso. **Archivo: Polis y visitas anteriores** conserva el juego previo.



La configuración completa está en `public/worlds/sartre.json`; el catálogo en `public/worlds/index.json`. El encuentro inicial, las parejas, clasificación y decisiones utilizan servicios comunes, sin condiciones por autor en el motor. La clasificación admite arrastre con ratón o dedo y selección accesible por botones.



El editor importa ilustraciones circulares y sprites y exporta/importa definiciones completas de mundo. Las ilustraciones circulares deben estar centradas en un lienzo cuadrado, con el suelo alineado con el radio común; el motor no inventa la geografía artística ni deduce una ruta irregular de los píxeles.



El caso de Sartre usa **arte provisional reutilizado**, no su geografía exterior definitiva. El diseño completo y las futuras ampliaciones se documentan en `docs/SARTRE-DISENO.md`.



- Decisiones del autor: `docs/DECISIONES-DE-DISENO.md` y `../AGENTS.md`.

- Auditoría: `docs/AUDITORIA-MOTOR.md`.

- Contratos, persistencia y cómo añadir contenido: `docs/ARQUITECTURA-MOTOR.md`.

- Verificación: `npm test`, `npm run build`, `npm run test:universe`; requiere Chrome instalado para las pruebas de navegador.



## Crear tus propios mundos



1. Abre **Editor → Crear nuevo mundo**. Indica nombre, autor e identidad permanente, época, personaje provisional y presentación. Se abre un borrador; los mundos nuevos aparecen en el universo.

2. Usa **Biblioteca completa de recursos** para reutilizar personajes, objetos existentes e imágenes de otros borradores. Añade el recurso a la paleta, escribe el nombre del objeto, elige **Objetos** y toca el escenario. Puedes renombrarlo después en el inspector.

3. Usa **Crear interior conectado** para elegir nombre y fondo. Se añade una puerta desde la escena actual y una de regreso. La lista de escenas permite entrar directamente a editar cada habitación.

4. En **Nombre y fondo de esta escena**, importa la ilustración del interior. Ajusta objetos, zonas invisibles, suelos y obstáculos con las herramientas habituales. Configura las puertas desde el inspector de comportamiento.

5. Guarda, prueba recorriendo las puertas y exporta el mundo completo. El JSON transporta los datos; no hace falta escribirlo para componer una habitación. Los diálogos ramificados y el contenido de minijuegos avanzados todavía se preparan en JSON.



Los recursos reutilizados son provisionales hasta diseñar el arte propio. Los filósofos permanecen en sus puntos de encuentro; el prisionero acompaña solo durante el rescate. El regreso por la caverna recorre las habitaciones anteriores antes de salir a la superficie.



Pruebas del creador: `npm run test:authoring` y `npm run test:resources` (Chrome instalado; `SOFIA_URL` permite indicar la dirección local).



## Seis planetas y generador por lotes



El universo incluye Platón y Sartre conservados, más Camus, Hegel, Kant y Heidegger como pruebas jugables con recursos provisionales. Cada mundo nuevo utiliza el mismo motor, plantillas y datos.



```sh

npm run generate:worlds

npm run validate:worlds

npm run connect -- "Conecta Camus con Sartre"

npm run connect -- "Conecta montaña de Camus con estudio de Kant"

```



El editor permite importar un lote, conectar escenas mediante esas instrucciones, crear identidades de NPC, cambiar su apariencia y editar conversaciones. Los interiores nuevos usan 1280×720 y suelo Y=560; los antiguos conservan sus coordenadas. La biblioteca incluye escaleras, dos niveles y ascensor funcional.



Guía y límites: [MUNDOS-GENERICOS.md](docs/MUNDOS-GENERICOS.md). Verificación y capturas: [VALIDACION-MOTOR.md](docs/VALIDACION-MOTOR.md).



## Viajar en la nave



Toca la nave de la superficie: Sofía entra y aparece en la cabina. Elige un planeta para ver el despegue, vuelo, aterrizaje y desembarque, o pulsa **Bajar de la nave** para cancelar. El botón Mundos conserva su consulta habitual. La secuencia respeta movimiento reducido y permite omitir la animación.



Detalles: [NAVE-Y-VIAJES.md](docs/NAVE-Y-VIAJES.md). Pruebas: `npm run test:spaceflight` y `python tests/browser_spaceflight_edges.py`.



## Historia, Libre y guardado



Elige modo al abrir el juego o desde **Pausa → Cambiar modo**. Historia abre los planetas por objetivos en este orden: Platón → Kant → Hegel → Heidegger → Sartre → Camus. Libre permite cualquier destino. Cada modo guarda su partida independiente; las partidas anteriores permanecen en Libre.



Hay guardado automático y **Pausa → Guardar partida**. **Continuar partida** recupera el mundo y la posición, también en interiores. Es un guardado local en el navegador.



La llegada no abre conversaciones: toca al filósofo o pulsa E/Enter estando cerca. Sofía y los NPC se orientan hacia su interlocutor. Detalles y configuración: [MODOS-Y-GUARDADO.md](docs/MODOS-Y-GUARDADO.md).



Para volver a cero: **Pausa → Empezar de nuevo → Reiniciar este mundo** o **Reiniciar todo el modo**. Se pide confirmación y se conservan el otro modo y los diseños del editor. Historia muestra candados sobre los planetas pendientes, en el orden de la ruta. Prueba específica: `npm run test:restart`.



En Historia, al empezar o reanudar se abre primero el mapa: elige un planeta sin candado para ver la llegada de Sofía en la nave y el aterrizaje. La exploración comienza después del desembarque, conservando los avances del mundo y sin abrir el diálogo del filósofo automáticamente. Libre mantiene su continuación habitual.



En los diálogos, **Enter** completa el texto y avanza. Si hay varias respuestas, **Tab** cambia de opción y **Enter** confirma. La pulsación sostenida no salta varios cuadros. Prueba: `npm run test:dialogue-enter`.





El círculo de mensaje bajo un personaje permite acercarse y conversar. Los bocadillos siguen al hablante, con estilo Pergamino o Tinta configurable por conversación. En **Editor → Editar diálogos** puedes crear turnos, respuestas y vínculos con una aparición de cada escena, además de importar/exportar conversaciones. Los interiores guardados ya son escenarios jugables. Guía: [Diálogos y niveles](docs/DIALOGOS-Y-NIVELES.md). Prueba: `npm run test:dialogue-stage`.





La caverna de Platón tiene cinco habitaciones y tres actos, con investigación, lámpara local, liberación, regreso obligatorio y dos desenlaces. [Recorrido y configuración](docs/CAVERNA-JUGABLE.md). Los bocadillos avanzan con toque/clic o Enter y solo muestran botones cuando hay una elección. Prueba completa: `npm run test:plato-adventure`.





El motor de autoría tiene rutas independientes: `/#/edicion`, `/#/dialogos` y `/#/preguntas` (alias `/#/minijuegos`). Permiten cargar escenas, importar imágenes, configurar objetos/conexiones, crear conversaciones/actividades y probarlas sin modificar la partida. [Guía de rutas y exportación del proyecto](docs/MOTOR-Y-RUTAS.md).



El inicio recuerda el último modo y ofrece Continuar, Cargar partida, Nueva partida y Cambiar modo. Cada partida tiene automático propio; desde Pausa se guardan puntos con nombre. Las partidas anteriores se incorporan sin reiniciar. [Guía de partidas](docs/MODOS-Y-GUARDADO.md). Validación del flujo actual: `npm run test:start-menu`.


Las nuevas partidas parten de la Tierra, con ilustración generada por IA y exploración radial. Se permite volver desde Platón sin completar sus misiones y entrar al templo/ágora. Los guardados anteriores se conservan. [Guía y prompt de la Tierra](docs/TIERRA-Y-REGRESO.md).


## Presentación inicial y publicación
La primera visita a la Tierra muestra el planeta completo y acerca la cámara. Después aparece un aviso breve del botón Vista; se recuerda por partida. [GitHub Pages](docs/GITHUB-PAGES.md) · [Auditoría y evolución modular](docs/EVOLUCION-MODULAR.md).


Los textos se editan en **Diálogos por escena**; el diseño global se configura aparte en **Aspecto de diálogos**. [Guía sencilla de conversaciones, regresos y versiones](docs/DIALOGOS-POR-ESCENA.md).


[Manual de zonas, conversaciones, decisiones y acontecimientos](docs/EDITOR-Y-ACONTECIMIENTOS.md).

## Documentos de cada mundo

- [Platón: estado actual, escenas, acciones, diálogos e ideas de desarrollo](docs/mundos/PLATON.md).

Los documentos de `docs/mundos/` reúnen el estado implementado y las propuestas de cada planeta. Las ideas pendientes se distinguen del contenido ya jugable.


## Mapa de cobertura curricular de Filosofía

- [Temario maestro INEVAL: 57 subtemas en seis áreas, ubicaciones propuestas en planetas y experiencias de aprendizaje](docs/CURRICULO-MAESTRO-FILOSOFIA-INEVAL-2026.md). Documento de planificación basado en las capturas y manual aportados; no modifica el juego ni constituye un temario oficial verificado de una convocatoria específica.


## Decisiones del editor visual de historias

- [Arquitectura de autoría tipo Genially: escenas, NPC, interacciones, misiones, archivos de diálogos e idiomas](docs/ARQUITECTURA-AUTORIA-DIALOGOS-MISIONES-I18N.md). Decisiones de diseño aprobadas; implementación incremental pendiente.

## Estudio de historias

Personajes (`/#/personajes`), guiones por escena (`/#/dialogos`) y objetivos/plantillas (`/#/misiones`) comparten los datos del motor y conservan las partidas. [Manual y límites de la primera entrega](docs/ESTUDIO-DE-HISTORIAS.md).


## Constructor visual de mecánicas reutilizables (decisiones para Codex)

- [Crear juegos seleccionando personajes, sprites y capacidades desde una paleta visual](docs/DECISIONES-EDITOR-VISUAL-MECANICAS-REUTILIZABLES.md). Especificación de producto y etapas de implementación Phaser 2D, presets, controles, eventos, compatibilidad, rendimiento y pruebas; **aún no implementada**.


## Playground de mecánicas · nave de Sofía

- [Probar el playground de mecánicas](playground.html) en Vite / GitHub Pages: nave con controles táctiles, falacias, sombras de Platón y mala fe de Sartre; no altera las partidas.
- [Documentación técnica y pedagógica del playground](docs/PLAYGROUND-MECANICAS-SOFIA.md). Es un prototipo independiente y configurable, no un SDK de mecánicas concluido.


## Pendiente aprobado: controles móviles y lámpara de Sofía

- [Joystick, botón contextual inteligente, encender/apagar lámpara y animaciones con herramienta](docs/PENDIENTE-CONTROLES-MOVILES-LAMPARA-SPRITES.md): decisiones, criterios de aceptación y backlog P0–P5 para Codex. **La caverna ya dispone de un encendido narrativo e iluminación: la nueva tarea es conmutación y control móvil, no reconstruirlo.**


### Controles contextuales y lámpara

[Uso, configuración, presets y límites de la lámpara](docs/CONTROLES-Y-EQUIPAMIENTO.md). Joystick táctil, interacción contextual y encendido/apagado persistente sobre la iluminación existente. `npm run test:mobile-lamp` y `npm run test:lamp-travel` ejecutan pruebas en Chrome con toque emulado. No son pruebas en teléfono físico.

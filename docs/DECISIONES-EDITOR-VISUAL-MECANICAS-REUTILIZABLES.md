# Decisiones aprobadas · Constructor visual de mecánicas reutilizables

**Proyecto:** Sofía y los mundos de las ideas · **Fecha:** 23 de noviembre de 2026  
**Estado:** decisiones de producto registradas para ejecución gradual mediante Codex. **No implementadas por el hecho de crear este documento.**  
**Inspiración:** captura aportada por el autor de un creador de juegos que presenta múltiples capacidades como una cuadrícula de iconos seleccionables. La captura es **referencia de facilidad de uso y selección de mecánicas**, no un mandato de copiar marca, sprites, iconos ni interfaz de terceros.

## 1. Decisión fundamental

El autor quiere **construir videojuegos sin reprogramar cada personaje o escenario**. En un editor visual intuitivo, similar en flujo de trabajo a Genially:

1. Crear o escoger un juego, mundo o escena (como una diapositiva jugable).
2. **Elegir/importar el fondo** y configurar suelo, plataformas, caminos, puertas y zonas sin deducir colisiones del dibujo.
3. **Elegir/importar personajes, NPC, enemigos, vehículos y objetos** desde una biblioteca de sprites e imágenes.
4. Colocarlos con toque o arrastre, editando tamaño, posición, orientación, hitbox y, cuando corresponda, ángulo radial.
5. Abrir una **paleta de mecánicas** visuales, representadas por iconos y nombres claros. Tocar «Caminar», «Correr», «Saltar», «Subir escalera», «Volar», «Nadar», «Empujar», «Interactuar», etc., para añadir **capacidades** al personaje u objeto seleccionado.
6. Configurar la capacidad con controles sencillos: velocidad, altura de salto, gravedad, restricciones, sonido, animación/sprite, controles de usuario o IA.
7. Vincular **eventos/condiciones/acciones** («cuando llega», «cuando toca», «si tiene llave», «al terminar», «ir a escena», «hablar con NPC», «iniciar actividad del minicore»).
8. Pulsar **Probar** en el mismo editor. Guardar datos y exportarlos para su publicación.
9. Reutilizar **perfiles de capacidades** en otros personajes, escenas, planetas y eventualmente otros videojuegos.

**Motor común, editor visual y datos configurables; no un nuevo programa por filósofo.**

## 2. Qué conservar del repositorio existente (estado comprobado)

- Phaser **3.90.0**, TypeScript y Vite.
- Movimiento radial de planetas en `src/planet-model.ts` y `src/planet-scene.ts`, incluyendo velocidad angular, apoyo, colisiones radiales, controles táctiles, cámara y guardado. **NO sustituir** por un controlador de plataformas.
- Movimiento lateral y plantillas de interiores (suelos, escaleras y ascensores) en el motor actual; `src/worlds/templates.ts` y controladores de escena. Mantener colisiones y retornos actuales.
- Edición de objetos, sprites, zonas, escenas, conexiones y acciones en `/#/edicion`.
- Estudio de Historias **ya funcional**: `/#/personajes`, `/#/dialogos`, `/#/misiones`, `/#/eventos`; identidades/apariciones, condiciones y acciones. Ver [estado implementado](ESTUDIO-DE-HISTORIAS.md).
- Fuente de conversaciones y preparativos para idiomas mediante exportación/compilación; NO implementar un nuevo intérprete de diálogos.
- Dos modos y partidas existentes; las pruebas del editor no deben guardar progreso en la partida real.

**El nuevo catálogo de capacidades complementa el Estudio de Historias: movimiento y acciones físicas = Gameplay Core; diálogos y misiones = Story Studio; minijuegos y Bloom = framework de preguntas; XP y recompensas = framework de gamificación. No duplicar sus responsabilidades.**

## 3. Tres cosas diferentes que el editor debe distinguir

| Concepto | ¿Qué significa? | Ejemplo |
|---|---|---|
| **Recurso gráfico** | Qué se ve; PNG/WebP, spritesheet, atlas o animación | Sofía, un caballo, un NPC genérico, un cofre |
| **Entidad/identidad** | Qué personaje u objeto es realmente; ID y estado persistente, independiente de la imagen | El mismo prisionero aparece en B, D y E; otro NPC puede usar su sprite sin ser él |
| **Comportamiento o capacidad** | Qué puede hacer y con qué parámetros | Sofía camina, el caballo patrulla, una puerta se abre |

Cambiar una imagen **no** debe borrar los comportamientos ni romper los eventos. Reutilizar un sprite **no** debe duplicar la identidad de un personaje. Reutilizar una capacidad **no** debe copiar indebidamente la historia ni las recompensas de otra escena.

## 4. Catálogo de mecánicas pensado a largo plazo

### 4.1 Movimiento y desplazamiento (primera familia)
- **Caminar lateral 2D** y **correr**; velocidad, aceleración, frenado, giro/flip y animación.
- **Caminar 4 u 8 direcciones** para futuros juegos RPG 2D, NO convertir automáticamente los interiores actuales a vista cenital.
- **Movimiento radial 2D** sobre una circunferencia/planeta: reutilizar controlador existente y parametrizar límites; **no se combina** sin un adaptador explícito con caminar lateral.
- **Saltar / doble salto opcional**, caer, gravedad, altura de salto, coyote time opcional; deshabilitado cuando no corresponde.
- **Escaleras, rampas, ascensores y plataformas móviles**; geometría configurable desde el editor.
- **Volar/flotar/planear** y **nadar** como futuras capacidades independientes; no exponerlas como implementadas antes de probarlas.
- **Vehículos/nave**: entrar/salir, despegar/aterrizar, cambios de controlador, sin reprogramar navegación interestelar ya existente.

### 4.2 Interacciones, objetos y mundo
- **Hablar**, examinar, recoger, usar, entregar, equipar, empujar, arrastrar y activar.
- **Abrir/cerrar puerta**, bloqueo por requisito, portal entre escenas o mundos, punto de llegada/regreso.
- **Interruptor, palanca, antorcha, lámpara, cadenas, cofre, plataforma**; plantilla de interacciones, no lógica ad hoc por mundo.
- **Observar/manipular experimento** (luz, sombra, variables/estados): el motor ofrece mover/escalar/mostrar/ocultar/registrar evidencia; la interpretación filosófica se define por datos y diálogos.
- **Lanzar actividad del framework de preguntas** con ID, resultado, feedback y flags, como integración futura.

### 4.3 Acción / personajes autónomos (fase posterior)
- **Disparar/lanzar proyectiles**, recoger munición, daño, salud, invulnerabilidad temporal.
- **Enemigo/NPC automático**: estar quieto, patrullar, seguir, huir, perseguir, mirar, reaccionar, atacar; estados con transiciones; configuración sencilla de detección, velocidad y límites.
- **Seguidor/compañero** (ya existe el caso prisionero, no romperlo).
- **Checkpoint, muerte y reaparición**, solo donde el proyecto los necesite.
- Prioridad: **no programar combate/enemigos antes de que una escena real los requiera**. Estarán visibles como «Planificado» o fuera del catálogo inicial, nunca como botones inertes que simulen funcionar.

### 4.4 Lo reutilizable en 2D y 3D
- Reutilizable sin cambios de dimensión: **intención** (`move`, `jump`, `interact`), contratos de entrada/salida, acciones y eventos, estados, parámetros, IA de alto nivel, perfiles, guardado y editor.
- **Distinto por motor/dimensión**: coordenadas, gravedad, colisiones, física, control de cámara, animaciones y proyección. Phaser 3 es 2D; 3D requiere adaptador distinto (Godot 3D / Three.js u otro) y **no es compatible automáticamente**.
- **Primera entrega es Phaser 2D**. Construir un SDK 3D universal ahora gastaría recursos y dificultaría probarlo.

## 5. Diseño del editor visual — modelo similar a la captura

El menú principal de creación mantiene una sola experiencia tipo Genially:

```text
CREADOR DE MUNDOS / JUEGOS
[Mundo ▼] [Escena ▼] [Personajes] [Objetos] [Mecánicas] [Eventos] [Probar]

┌──────────────────────────── LIENZO JUGABLE ───────────────────────────┐
│  imagen de fondo  ·  NPC · Sofía · puerta · antorcha                   │
│  zonas caminables/colisiones visibles SOLO al editar                  │
└───────────────────────────────────────────────────────────────────────┘

Elemento seleccionado: Sofía                [Editar sprite] [Cambiar recurso]
MECÁNICAS DISPONIBLES  (filtro: Movimiento / Interacción / Acción)
[Caminar ✓] [Correr +] [Saltar +] [Escaleras ✓] [Volar +]
[Hablar ✓]  [Recoger +] [Empujar +] [Disparar • previsto]
Al seleccionar «Caminar»:
  Velocidad [_____slider]   Controles [Toque / Teclado / IA]
  Animación [idle / walk]   Colisión [cuerpo configurado]
  Condición [Siempre]      [PROBAR] [GUARDAR PRESET]
```

**Usabilidad obligatoria:** panel comprensible para una persona sin conocimientos de programación; icono + nombre (no iconos solos); categorías y búsqueda; mostrar «Disponible / Requiere animación / Próximamente» como texto no intrusivo; configuración básica visible y avanzada plegada; deshacer/rehacer, duplicar, plantillas, inspección de errores, diseño táctil y escritorio.

**No permitir combinaciones inválidas silenciosas:** por ejemplo, dos controladores principales que mueven el mismo personaje a la vez o salto sin un controlador de gravedad compatible. Resolver con perfiles por contexto: `radial-2d`, `side-scroller-2d`, `top-down-2d`, `flight-2d`. Un personaje puede cambiar de perfil **al entrar en otra escena** sin perder identidad.

## 6. Biblioteca gráfica y de recursos

- Cargar PNG, WebP, JPEG; para movimiento animado, spritesheets/atlases con metadatos de frames y animaciones. Una imagen estática sigue siendo válida para un NPC quieto o placeholder, pero no equivale a una animación.
- Biblioteca con **Personajes**, **NPC**, **Fondos**, **Objetos**, **Vehículos**, **Efectos**, **Sonidos**, **Animaciones**.
- Los recursos tienen `assetId` estable, descripción/tags, origen, dimensiones, tamaño, estado de publicación y referencias de uso. Detectar cambios de recurso que afecten escala/colisión.
- Separar **sprite/prefab reutilizable** de **instancia concreta** y de **identidad narrativa**. Un mismo icono puede ser Sísifo en unas escenas y otro NPC distinto en otras; la identidad no se decide por similitud de imagen.
- Seleccionar imagen del fondo no crea colisiones automáticamente: permitir dibujar suelo plano, escaleras, obstáculos, regiones y puntos de interacción encima del fondo.
- Mantener importación/exportación, copias y manifestaciones actuales; no embeber indiscriminadamente centenares de imágenes en un JSON de mundo para producción.

## 7. Contrato de datos deseado — PROUESTA, NO ESQUEMA IMPLEMENTADO

```json
{
  "entityId": "sofia",
  "sceneId": "platon_entrada",
  "spriteId": "sofia-standard",
  "controllerProfile": "side-scroller-2d",
  "behaviors": [
    { "type": "walk", "enabled": true, "speed": 180 },
    { "type": "run", "enabled": false, "speed": 260 },
    { "type": "stairs", "enabled": true },
    { "type": "interact", "enabled": true, "distance": 60 }
  ],
  "onInteract": [
    { "type": "talk", "target": "dialogue-id" }
  ]
}
```

**La forma definitiva se decide tras auditar `WorldDefinition`, entidades, acciones, perfiles y editor existentes.** Se debe compilar/validar hacia los contratos actuales; **no** exigir que los JSON publicados cambien antes de tener migraciones y pruebas de equivalencia. El lenguaje del usuario será «Velocidad: normal» y «Puede subir escaleras», no editar esta sintaxis.

## 8. Arquitectura y repositorio

**Decisión a largo plazo:** convertir las mecánicas en un **framework independiente reutilizable**, no acoplado a la filosofía ni al nombre de Sofía. No crear desde el primer día una copia paralela del controlador actual.

Fases recomendadas:
1. **Local primero:** identificar y encapsular el movimiento/reacciones compartidas dentro del repo de Sofía con interfaces TypeScript tipadas, tests y adaptadores Phaser para lateral/radial; sin alterar su comportamiento.
2. **Editor de capacidades:** fichas de personaje/objeto con paleta, presets y validación; mostrar en Phaser escenas actuales.
3. **Nuevos módulos bajo demanda:** carrera, salto, seguimiento, vuelo, acción, etc. con tests de compatibilidad y control táctil.
4. **Extraer paquete independiente** (por ejemplo `gameplay-framework` o `@luchitoflores/gameplay-core`) **cuando al menos dos proyectos lo reutilicen de verdad**; mantener versiones semánticas, changelog y adaptador `phaser-2d`.
5. **Adaptador 3D futuro**: nuevo controlador y física; compartir el contrato, no prometer el mismo algoritmo ni sprites.

Esto reduce el coste de Codex y evita que refactorizar el motor de Sofía rompa los mundos actuales.

## 9. Rendimiento, publicación y móviles

- Mobile first, orientación horizontal para jugar; controles táctiles configurables, teclado y accesibilidad.
- **Lazy loading por escena:** precargar únicamente habitación actual + comunes + algunos recursos del siguiente destino; liberar texturas que no están en uso. Los mundos existentes ya tienen carga por mundo; todavía no debe asumirse carga por habitación implementada.
- Para 30 planetas × 6 accesos × 5 fondos = **900 imágenes de interiores**, con un promedio hipotético de 350 KB = **315 MB solo de fondos comprimidos**. Una imagen 1920×1080 RGBA puede consumir ~8,3 MB de memoria de textura; NO cargar todas simultáneamente.
- Reutilización y optimización de sprites, atlas por mundo cuando convenga, WebP, imágenes reducidas según dispositivo y manifests. No exigir un atlas monolítico.
- **GitHub Pages** para el sitio completo, respetando sus límites de sitio y tráfico; **itch.io** para demo o build con presupuesto de tamaño/archivos ajustado a sus límites vigentes. Validar métricas de carga y memoria en teléfono físico antes de prometer rendimiento.
- El juego debe poder continuar con un recurso ausente de forma controlada: imagen placeholder, error explicado y no bloquear la partida por un recurso opcional.

## 10. Prioridad para Codex: primeras entregas pequeñas, verificables

### Entrega 0 — Auditoría sin cambios
- Enumerar controladores y capacidades **reales** en repo, tipar dependencias y detectar duplicaciones.
- Mapear `radial-2d` versus `side-scroller-2d`, controles táctiles, NPC y editor.
- Identificar cambios mínimos para introducir `behaviorPresets` sin migración destructiva.
- Documentar riesgos para guardar partidas, escenas actuales y controles.
- **No programar todo el framework ni extraer repo aparte todavía.**

### Entrega 1 — Paleta y presets funcionales para escena lateral de Platón
- Añadir en el editor existente una pestaña **«Mecánicas»** al seleccionar a Sofía, un NPC u objeto.
- Mostrar iconos/nombres/estado real de capacidades; por defecto únicamente capacidades implementadas y comprobadas.
- Activar/desactivar **Caminar**, **Interactuar** y **Escaleras** donde el esquema lo permita, con configuración y validación en tiempo real; si **Correr** aún no existe, implementarlo de modo incremental como primera mecánica nueva simple o marcarlo «Próximamente».
- Guardar un preset reutilizable **«Exploración lateral»**, asignarlo a otra escena y probar; volver sin perder controles radiales.
- **No añadir disparos, enemigos ni vuelo en esta entrega.**

### Entrega 2 — Personajes y recursos configurables
- Importar/sustituir sprite, elegir animaciones disponibles, asignar preset a NPC/objeto, preservar ID y diálogos, mostrar «dónde se usa».
- Validar y resolver problemas de colisión, tamaño y recursos faltantes.

### Entrega 3 — Generalización y nuevos comportamientos bajo demanda
- Añadir salto, correr, estados de NPC y seguimiento, usando presets y adaptadores comprobables; después sólo lo que el juego necesite.
- Integrar evento tipado `launchActivity` con el framework de preguntas cuando haya minijuegos reales.
- Preparar distribución como paquete cuando otro juego pueda consumir una versión estable.

## 11. Criterios de aceptación / pruebas

La entrega 1 estará lista **solo si**:
1. El autor abre `/#/edicion`, selecciona un personaje y ve paleta por categorías con **nombre e icono**.
2. Puede asignar una capacidad existente, configurar parámetros y previsualizarla **sin modificar archivos TypeScript**.
3. El preset asignado funciona realmente tras guardar, recargar e importar/exportar.
4. Al reutilizar el mismo sprite en otro NPC, la **identidad narrativa** y los diálogos siguen independientes.
5. El planeta de Platón **continúa** caminándose radialmente; la Caverna A–E conserva escaleras, puertas, iluminación, prisionero y su progreso.
6. Historia/Libre, las rutas del Estudio de Historias y los guardados antiguos siguen funcionando.
7. El toque en móvil horizontal no ejecuta una acción equivocada al arrastrar iconos ni bloquea controles.
8. Tests unitarios de presets/validación + prueba en navegador del editor/juego; ejecutar `npm run check`, `npm test`, `npm run build`, y registrar resultados reales.
9. No declarar «implementado» aquello que solo aparece en el catálogo; todos los botones funcionales deben ejecutar su comportamiento o estar claramente deshabilitados.
10. El código producido separa datos/comportamientos de referencias filosóficas y de UI para futura extracción a otro juego.

## 12. Instrucción única para Codex
> Lee este documento, `docs/ESTUDIO-DE-HISTORIAS.md`, `docs/ARQUITECTURA-AUTORIA-DIALOGOS-MISIONES-I18N.md`, `docs/EVOLUCION-MODULAR.md` y el código actual. No sustituyas lo existente. Empieza por la **Entrega 0 (auditoría)** y luego desarrolla exclusivamente la **Entrega 1**, con la paleta real de mecánicas, parámetros, presets y prueba en escena lateral. Mantén movimiento radial y lateral, diálogos, escenas, navegación, guardados y exportación. No crees todavía un nuevo repositorio ni prometas compatibilidad 3D. Acompaña tus cambios de pruebas y documentación verificada.

---

**Referencias del propio proyecto:** [Diseño del editor tipo Genially](ARQUITECTURA-AUTORIA-DIALOGOS-MISIONES-I18N.md) · [Primera entrega del Estudio de Historias](ESTUDIO-DE-HISTORIAS.md) · [Arquitectura del motor](ARQUITECTURA-MOTOR.md) · [Evolución modular](EVOLUCION-MODULAR.md).


## 13. Decisión confirmada: mecánicas de juego ≠ minijuegos educativos

**Confirmación del autor, noviembre 2026.** La paleta visual del anuncio aportado es una **referencia de experiencia de usuario**: escoger capacidades prefabricadas desde iconos e importar imágenes/sprites. No se trata de copiar ese juego, sus personajes ni sus recursos.

**No confundir los tres niveles:**

| Sistema | Responsabilidad | Ejemplo |
|---|---|---|
| **Gameplay Core** | Cómo se mueve y actúa una entidad: caminar, correr, volar, saltar, apuntar, disparar, colisionar, iluminar, mover objetos, perseguir, usar un mecanismo | Un mismo módulo de proyectiles funciona con la nave o con Sofía caminando |
| **Framework de Preguntas / Minijuegos** | Qué reto cognitivo se plantea, objetivos válidos/invalidos, contenidos, evaluación, feedback, evidencias y nivel de Bloom | «Cazar falacias» aprovecha apuntar y disparar, pero valida argumentos; «Sombras» aprovecha luz y manipulación |
| **Estudio de Historias** | Cuándo y dónde se lanza el reto; NPC, misión, escenas, requisitos, estados y resultados | Entrar a una sala y desbloquear el diálogo al demostrar el origen de una sombra |
| **Gamificación** | Logros, XP, premios, pergaminos, progreso de colecciones | Registrar evidencia correcta y conceder sello del folio |

**Consecuencia arquitectónica:** «disparar» **es una mecánica**; «disparar a falacias», «disparar luz a sombras» y «cuestionar mala fe» **son actividades educativas** configuradas sobre una o varias mecánicas. No codificar un controlador de disparo nuevo para cada filósofo ni implementar el sistema de preguntas dos veces.

### Personajes y equipos intercambiables

- **Sofía a pie** (escena 2D lateral): caminar, saltar, apuntar y utilizar un instrumento de luz o herramienta de lanzamiento; sprite, animación, hitbox y origen del proyectil propios.
- **Sofía en su nave** (escena de vuelo): mover X/Y, apuntar y disparar pulsos; misma API de disparo/impacto, distinto controlador, sprite, origen y VFX.
- **NPC / enemigos / objetos**: patrolla, seguimiento, interacción y uso de herramientas, si una experiencia concreta lo requiere.
- Las armas/herramientas no deben acoplarse a «nave» ni a «Sofía»: `equipableId`, `actorId`, `spawnOffset`, `projectilePresetId`, `onHit` y restricciones por contexto son conceptos de contrato propuesto.
- La vista lateral **no** se transforma automáticamente en RPG cenital y los planetas radiales **no** cambian su física para habilitar un arma.

### Retroalimentación del playground

El usuario detectó que los textos largos tapan el juego. Estándar aprobado:
1. Mientras se juega: **aviso de una sola línea, discreto, breve**, que nunca bloquee controles.
2. Debajo/fuera del lienzo: **panel de hallazgos** con explicación filosófica completa, retroalimentación negativa constructiva y registro consultable.
3. Las reflexiones extensas se mostrarán **cuando el jugador pausa o termina** un desafío, no como ventanas modales que interrumpen cada impacto.
4. En escenas reales, conservar accesibilidad de lectura, tamaño de fuentes, contraste y controles táctiles; la retroalimentación de filosofía jamás debe confundirse con indicadores de daño/combate.
5. Permitir configurar en la versión futura del editor la política de feedback: discreta, al terminar, diálogo con NPC, completa en panel, según actividad.

### Nuevo criterio de demostración

El Playground de Mecánicas probará **dos tipos de portador** (nave y personaje a pie) y **una mecánica compartida** (disparo/proyectil) con distintas experiencias. El modo a pie inicial usa sprite provisional y una plataforma plana. No constituye un controlador de juego lateral completo ni sustituye los controladores de la caverna existentes. Sus configuraciones de velocidad y cadencia no editan mundos reales.

**Próximos avances para Codex:** dibujar/seleccionar actor en editor, configurar presets de movimiento y herramientas, separar la lógica de evaluación del juego de acción, ampliar demos a recoger, esquivar, perseguir y activar, integrar al minicore con resultado tipado. Solo extraer SDK independiente cuando exista uso repetido en otro juego.

## 14. Plantilla reutilizable de juegos — 24 de noviembre de 2026

**Objetivo confirmado por el autor:** disponer de un proyecto base como sus plantillas de Genially: cambiar personajes, historia y escenarios conservando las mecánicas y unas ventanas de configuración comprensibles. Sofía será el primer juego que utiliza esa base; la identidad de Sofía y el universo filosófico no deben ser requisitos de futuros juegos.

Recorrido deseado: **Crear juego desde plantilla → cambiar personajes y escenarios → escribir historia → conectar acciones → probar → exportar**. Es un objetivo de producto, no una función completa disponible hoy. Conservar el motor común de Phaser y los datos existentes; esta conversación no autoriza una migración a GDevelop ni una reescritura.

### Estado actual y prioridades pendientes

| Capacidad | Estado al registrar la decisión |
|---|---|
| Crear mundos e interiores desde bases, cambiar fondos, colocar NPC/objetos y conectar puertas | Disponible; mejorar la facilidad de autoría |
| Conversaciones con condiciones, decisiones y consecuencias | Disponible mediante formularios y vistas por escena |
| Duplicar una escena completa desde un botón | Pendiente |
| Guardar una composición como plantilla reutilizable | Pendiente de completar como flujo del editor |
| Editor visual de capas parallax | Pendiente; los interiores laterales actuales usan un fondo principal |
| Asignar libremente correr, saltar o agacharse desde cualquier escena narrativa | Pendiente de integrar; el controlador se prueba en el playground |
| Crear y exportar otro juego independiente desde una plantilla | Objetivo pendiente; no confundir exportar el proyecto actual con generar otro juego completo |

Orden acordado de trabajo: **duplicar escenas → guardar plantillas → editar capas parallax → aplicar mecánicas desde el editor → crear otro juego desde plantilla**. Desarrollar incrementalmente y comprobar qué existe antes de añadir sistemas.

Duplicar deberá permitir elegir qué conservar: fondo, objetos, geometría, NPC, conversaciones, puertas, eventos y objetivos. Generar los IDs nuevos que correspondan y ajustar referencias internas; distinguir reutilizar una identidad de personaje de crear otra. Modificar la copia no debe alterar el original ni copiar progreso jugado. Las conexiones externas deben revisarse explícitamente.

El editor parallax deberá permitir cargar capas independientes, ordenarlas, ajustar su velocidad relativa y mover una cámara de prueba para ver el resultado. El suelo y las colisiones siguen siendo geometría manual independiente del arte. Conservar las escenas de fondo único; exportar capas y recursos mediante datos validados. Crear imágenes por capas en una herramienta gráfica no equivale a tener ya un editor parallax dentro del juego.

## 15. Autoría de diálogos: estado y dirección visual — 24 de noviembre de 2026

**Petición del autor:** registrar cómo funciona el editor actual y qué falta para acercarlo a una experiencia visual como TyranoBuilder. La referencia es su autoría con componentes arrastrables, descrita en su [sitio oficial](https://tyranobuilder.com/). No se propone adoptar su motor ni afirmar compatibilidad con sus proyectos.

### Lo que funciona actualmente

Recorrido: **mundo → escena → conversación → momento/variante → turnos → condiciones y consecuencias → prueba contextual**. El manual del estado funcional está en [Estudio de historias](ESTUDIO-DE-HISTORIAS.md) y la localización de conversaciones en [Diálogos por escena](DIALOGOS-POR-ESCENA.md).

- Las conversaciones se localizan por escena, personaje u objeto; también hay encuentros de llegada/regreso y versiones condicionadas. La numeración ayuda a encontrarlas, no impone el orden del juego.
- Se pueden añadir textos y turnos, alternar interlocutores, configurar decisiones y bifurcaciones y eliminar textos con confirmación. «Turno» selecciona lo que se edita; «Primer turno» configura el inicio de la conversación.
- Los momentos nombrados permiten diferenciar, por ejemplo, «primera visita», «regreso tras el ascenso» o «prisionero que decide quedarse». Las condiciones y su prioridad eligen la entrada válida; no basta contar cuántas veces se habló.
- Los resultados de respuestas y acciones se relacionan con acontecimientos, requisitos de objetivos y puertas. Registrar un acontecimiento no inventa por sí solo la acción de abrir una puerta: esa acción debe estar conectada.
- La identidad y el seguimiento del compañero son independientes de sus diálogos por habitación. Mantener al mismo prisionero al subir, regresar y decidir su desenlace.
- El aspecto global del bocadillo se configura aparte en `/#/apariencia`. Las pruebas no deben guardar avances de la partida real.

**Límite actual:** la autoría se basa principalmente en listas y formularios. Tener nodos y bifurcaciones en los datos no significa disponer ya de una secuencia gráfica arrastrable ni de un grafo visual completo.

### Mejoras propuestas para validar antes de implementarlas

1. Mostrar la escena de referencia junto al guion. Seleccionar un NPC en ella debe llevar directamente a sus conversaciones y momentos, aprovechando los enlaces que ya existen.
2. Sustituir la edición dispersa por una secuencia de bloques legibles: interlocutor, retrato y texto editables en el mismo bloque. Arrastrar para ordenar una secuencia; las ramas deben mostrar destinos explícitos, sin romper conexiones al mover un bloque.
3. Ofrecer una paleta pequeña: hablar, respuesta de Sofía, decisión y acción existente del motor. Cada componente debe corresponder a un comportamiento validado y real.
4. Hacer visibles los momentos y sus requisitos en lenguaje cotidiano: antes/después de una misión, al regresar de otra habitación, acompañado o solo. Mantener los IDs estables internamente.
5. Previsualizar el bocadillo con el tema global y probar desde el turno o momento elegido, con un estado simulado visible. Conservar la prueba contextual existente como base.
6. Facilitar duplicar conversaciones/momentos, confirmar eliminaciones y recuperar errores; advertir sobre destinos ausentes y condiciones incompatibles. La validación actual es parcial y no demuestra que toda rama sea alcanzable.

Esta lista es una **dirección de mejora pendiente de validar visualmente**, no una interfaz ya implementada ni un mockup aprobado. Reutilizar el intérprete, los nodos, entradas condicionales, acciones y exportación actuales; la mejora principal es cómo el autor los ve y modifica. Separar siempre **apariencia global**, **guion de la escena** y **acontecimientos/objetivos** con enlaces claros entre ellos.


### Implementación posterior de la sección 15

El 24 de noviembre se implementaron bloques con texto editable, selección y destinos visibles, referencia del escenario, accesos por interlocutor y momento, paleta de textos/decisiones/bifurcaciones, duplicación de bloque, arrastre de secuencias lineales, botones accesibles de orden, deshacer/rehacer local y prueba contextual desde el turno sin guardar. Guía y límites actuales: [Estudio de historias](ESTUDIO-DE-HISTORIAS.md#guion-visual--actualización-del-24-de-noviembre-de-2026).

También se implementaron duplicación completa de conversaciones desde el índice y edición de condiciones/prioridad de momentos dentro del guion. Sigue pendiente el grafo de conexiones con cables arrastrables; los destinos actuales son botones y selectores explícitos. Las plantillas de juegos, duplicación de escenarios y parallax de la sección 14 no se implementan en esta entrega.

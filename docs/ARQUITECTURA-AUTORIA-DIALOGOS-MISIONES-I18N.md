# Propuesta de arquitectura: editor visual de diálogos, misiones, escenas y traducciones

**Estado:** decisiones de experiencia de autoría APROBADAS por el autor (enfoque tipo Genially, 23-11-2026); organización de archivos y pasos técnicos sujetos a validación. **NO IMPLEMENTADAS.** No reemplaza el sistema actual ni modifica partidas. Revisar contra el código vivo antes de implementar.

## 0. Qué existe realmente y no debemos romper

En el repositorio actual ya existen:

- `/#/edicion`: escenarios, fondos, objetos, zonas de suelo/camino, obstáculos, escaleras, entradas, cadenas ordenadas de acciones, prueba de escenas.
- `/#/dialogos`: índice de conversaciones por mundo y escena, editor de turnos y ramas, vínculos a apariciones, prioridades y condiciones. `/#/apariencia`: presentación global independiente.
- `/#/eventos`: estados, objetivos, resultados y apertura de puertas por condiciones.
- `worlds/dialogues.ts`: formato `sofia-dialogues` (v1) que exporta/importa conversaciones por mundo y sus vínculos, sin reemplazar la escena.
- `public/worlds/plato.json`: contiene actualmente `dialogues`, `missions`, `characters`, `interactions`, `interiors`; 15 conversaciones nominales. El prisionero usa `entries` con distintas condiciones y nodos iniciales de la **misma conversación**.
- Borradores guardados en IndexedDB; exportación `sofia-proyecto-motor.json` e incorporación mediante `npm run apply:project -- <archivo> --apply`. **Guardar en navegador no publica automáticamente en GitHub.**
- Hay un acoplamiento pendiente de separar en `Universe`, `main.ts` y `ContentPlayer`, documentado en `docs/EVOLUCION-MODULAR.md`.

No reemplazar el motor de diálogos existente por TyranoBuilder, Ren'Py, Ink o Yarn. La inspiración es de *usabilidad*, no de dependencia técnica.

## 1. La experiencia de autoría objetivo

**Principio:** el autor no edita TypeScript ni identificadores para escribir una historia. Desde un único «Estudio de historias» selecciona mundo, misión, escena y personaje. Añade conversación, condición y resultado en formularios de lenguaje natural. Un «modo avanzado» muestra ramificaciones y JSON **solo si lo solicita**.

Tres vistas relacionadas, usando el mismo repositorio de datos:
1. **Escenas**: composición de fondo, suelos, escaleras, rutas, NPC y objetos (editor actual mejorado).
2. **Conversaciones**: ficha de cada NPC; conversaciones por escena/etapa; guion de turnos con respuestas; vista previa y simulación de flags.
3. **Misiones**: *línea de tiempo* de objetivos/eventos con precondiciones y efectos; flechas hacia escenas y conversaciones. No es obligatorio un grafo visual universal.

Pestañas: `[Escenario] [Personajes] [Diálogos] [Misión] [Probar]`. Selector superior: `Mundo: Platón › Misión: La caverna › Escena: Prisioneros`.

**Tarjeta de NPC:** nombre, retrato, identidad permanente, apariciones actuales por escena, número de conversaciones únicas, número de intervenciones/nodos, número de variantes condicionadas, misiones relacionadas y lista «Dónde aparece». **Los contadores se calculan** de las referencias, no se escriben manualmente en JSON.

**Diálogo sencillo:** título → con quién → cuándo aparece → guion por turnos → opciones → qué sucede después → guardar/probar. Acciones pueden añadir flags, activar NPC, abrir puerta, mover acompañante, comenzar actividad, obtener folio, mostrar mensaje, cambiar escena. **No ejecutar código arbitrario desde archivos de autoría.**

**Misión sencilla:** «Hablar con prisionero» → «Investigar fuego y figuras» → «Regresar con él» → «Liberar cadenas» → «Ascender» → «Regresar» → «Elegir» → «Segundo ascenso». Cada paso apunta a un *evento u objetivo*, no duplica diálogos.

## 2. El modelo mínimo de datos compartidos

| Concepto | ID / significado | Ejemplo |
|---|---|---|
| Mundo | `worldId`, no cambia al renombrar título | `plato` |
| Escena | `sceneId` permanente | `prisioneros` |
| Identidad del personaje | `characterId`, compartido entre apariciones | `prisionero` |
| Aparición | `instanceId`, concreta en escena (posición, sprite, comportamiento) | `prisionero-b` |
| Conversación | `dialogueId` único por mundo; puede usarse en varias escenas | `prisionero` |
| Nodo de texto | `nodeId` del grafo; identificable de manera estable | `evidencias` |
| Objetivo de misión | `objectiveId` / `flag`; guardado en progreso | `sombras_comprendidas` |
| Evento / efecto | acción permitida del motor | `setFlag`, `enter`, `talk`, `activate` |
| Texto de interfaz | clave estable, independiente del idioma | `ui.actions.talk` |

**No confundir el número de líneas con el número de conversaciones.** Un NPC puede tener 1 conversación con 10 nodos y 4 entradas según el estado; al aparecer en 3 habitaciones no pasa automáticamente a tener 3 identidades.

**Visibilidad de diálogo:** el editor debe resolver por aparición, escena, flags requeridos, prioridad, repetición (una vez / cada visita / siempre), entrada contextual y estado. Si no hay conversación válida, mostrar una respuesta por defecto o no activar el diálogo; no dejar una interfaz en blanco.

**Motor único para todas las relaciones:** `when` = condiciones evaluables; `then` = acciones tipadas; `next` = siguiente nodo o paso; `once` = política de repetición. Reutilizar el esquema existente `requires`, `entries`, `reward.flags` y `actions`; diseñar adaptadores cuando necesitemos una semántica nueva. La interfaz debe traducir «Si Sofía descubrió las sombras» a `requires: ["sombras_comprendidas"]` sin pedir al usuario teclear una clave.

### Ejemplo REAL compatible con el formato actual
El diálogo `prisionero` tiene `start: "pregunta"` y entradas como:
```json
{
  "start": "pregunta",
  "entries": [
    { "requires": ["prisionero_se_queda"], "node": "se-queda" },
    { "requires": ["prisionero_liberado"], "node": "libre" },
    { "requires": ["prisionero_acepta"], "node": "espera" },
    { "requires": ["sombras_comprendidas"], "node": "evidencias" }
  ]
}
```
Se elige la primera entrada cuyas condiciones se cumplen; sin ellas, el nodo por defecto. **Respetar el orden y las prioridades efectivas del intérprete existente**, no cambiarlas al separar archivos.

## 3. Separación de archivos sin perder compatibilidad

**Objetivo de autoría futuro; aún NO es el formato cargado directamente por Phaser.**

```text
content/
  worlds/
    plato/
      scenes.json             # exterior, interiores, NPC colocados, objetos, puertas
      missions.json           # objetivos, condiciones y orden narrativo
      dialogues.flow.json     # nodos, speakerId, elecciones, condiciones, efectos, SIN idioma
      locales/
        es.json               # textos de nodos y respuestas, nombres visibles
        en.json               # traducción futura, mismas claves
    sartre/ ...
  locales/
    es/ui.json                # botones, menús, mensajes globales
    en/ui.json
public/worlds/plato.json      # artefacto COMPILADO/compatible con el motor actual
```

**Importante:** NO crear 10.000 archivos ni exigir al autor navegar carpetas. En la interfaz, «Platón › Diálogos» se siente como **un solo banco**. Si el proyecto sigue pequeño, podemos conservar **un único paquete `sofia-dialogues` por mundo** como archivo de trabajo intermedio y desarrollar la división `flow + locales` mediante un exportador cuando empecemos traducciones. No migrar masivamente antes de validar.

**Dirección recomendada para localización:** separar **lógica del idioma**: los IDs, condiciones y destinos se quedan en `flow`; el texto traducible va en `locales/es.json`, `locales/en.json`. No duplicar reglas y ramas en cada idioma. La interfaz tiene archivos propios; las líneas de NPC se almacenan por mundo. El idioma seleccionado es único en preferencias y tiene español como fallback si falta una traducción. Los cambios de traducción no alteran guardados, condiciones ni resultados.

Ejemplo **propuesto**, no esquema actual:
```json
{
  "dialogueId": "prisionero",
  "nodeId": "evidencias",
  "speakerId": "prisionero",
  "textKey": "dialogue.prisionero.evidencias",
  "choices": [
    { "id": "mostrar", "textKey": "choice.prisionero.mostrar",
      "next": "aceptar" }
  ]
}
```
```json
{
  "dialogue.prisionero.evidencias": "Encontraste objetos detrás del muro. ¿De dónde proceden las sombras?",
  "choice.prisionero.mostrar": "Te mostraré cómo cambia su proyección."
}
```

**Compatibilidad:** `build-content` (o adaptador al `apply:project`) fusionaría las fuentes normalizadas y el idioma por defecto en el JSON final **sin cambiar** el cargador existente al principio. Validar equivalencia lógica/semántica antes de sustituir el JSON integrado.

## 4. Flujo práctico de edición y publicación

1. **Nuevo diálogo**: desde escena → NPC → «Añadir conversación» → nombre, momento, texto, alternativas. El editor asigna UUID/ID estable automáticamente; contador y vínculos se recalculan.
2. **Editar**: seleccionar conversación en el índice. Editar texto, nodo, condición o acción. Revalidar todas las entradas y salidas. Previsualizar con marcas de misión simuladas.
3. **Eliminar**: si no hay referencias, permitir borrado; si una escena/misión lo usa, **advertir dónde**, ofrecer desvincular o archivar. Nunca borrar silenciosamente flags y guardados antiguos. Dar **Deshacer**.
4. **Publicar en su propio navegador**: guardar borrador validado en IndexedDB (como ya ocurre).
5. **Publicar en el repositorio**: exportar paquete/proyecto, ejecutar `npm run apply:project -- ... --apply` con backups y pruebas, o usar una integración de GitHub autenticada que genere PR; **el navegador no puede escribir por sí solo a GitHub de forma segura** sin ese flujo. No confundir «Guardar» con «Publicar».
6. **Internacionalizar**: idioma de interfaz y texto separados; probar faltantes, traducciones de opciones, saltos de línea y expansión de bocadillos.

## 5. Validaciones automáticas obligatorias

- ID inexistente de NPC, escena, actividad, diálogo, texto de idioma, siguiente nodo, puerta o flag.
- Duplicados de IDs, enlaces rotos, ramas sin salida, condiciones imposibles, objetivos sin productor, eventos que vuelven a ejecutarse de manera incontrolada.
- Conversaciones que nunca pueden dispararse (conflicto de prioridades); diálogo de llegada activado cada visita por accidente.
- NPC con varias instancias: comprobar continuidad de estado, retrato y aparición correcta; no duplicar personalidad/identidad al reutilizar sprite.
- Una escena que permite llegar a una puerta bloqueada debe indicar cómo desbloquearla; verificar posibilidad de completar misión.
- Traducciones ausentes: usar fallback, señalar en panel «por traducir»; conservar placeholders.
- Compatibilidad con progreso y partida anterior: flags e IDs nunca se renombran silenciosamente; archivar en vez de borrar contenido usado.
- Contadores reales calculados: conversaciones, nodos, apariciones, ramas, misiones, condiciones y referencias huérfanas.
- Prueba Historia/Libre y móvil horizontal sin que teclado o botones superpuestos impidan diálogo.

## 6. Diseño de interfaz inicial (sin construir Genially completo)

Vista principal de escenas:
```text
[Platón ▾] [La caverna ▾] [B · Prisioneros ▾]  [PROBAR]
┌────────────────────────────────────────┬───────────────────────────┐
│ FOTO DE LA ESCENA Y SPRITES            │ NPC: El prisionero        │
│ Sofía  →  [Prisionero]  [Cadenas]       │ 1 diálogo · 10 turnos     │
│  suelo, puerta, zonas visibles         │ 4 entradas condicionales  │
│                                       │ [Ver conversaciones]      │
└────────────────────────────────────────┴───────────────────────────┘
Misión: La caverna  [Investigar] → [Convencer] → [Liberar] → [Ascender]
```
Vista de conversación:
```text
NPC: Prisionero   Escena: B   Misión: La caverna
Cuándo: [Sofía descubrió sombras ▾] Prioridad: [Auto]
1. Sofía: [Encontré un fuego y objetos detrás del muro...]
2. Prisionero: [¿Cómo puedes saberlo?]
3. Opciones: [+ Mostrar pruebas]  [+ Escuchar temores]
Al escoger [+ Añadir resultado] → [El prisionero acepta salir]
[PROBAR CONVERSACIÓN] [DÓNDE SE UTILIZA] [GUARDAR]
```

**Modo avanzado** opcional: ver grafo de nodos y ramificaciones como TyranoBuilder. El flujo lineal debe ser el predeterminado para que escribir cuatro intercambios no requiera dibujar cuatro flechas.

## 7. Implementación incremental (no romper el motor)

**Etapa 1 — Organización/UX sin nuevo formato:** ficha NPC con contadores y todos sus usos; selector misión/escena; etiquetas legibles para condiciones; navegación entre eventos, diálogos y objetivos; enlaces a «Dónde se usa»; editor rápido de nuevos turnos. Usar directamente `world.dialogues` y el importador existente.

**Etapa 2 — Misiones visuales:** una línea temporal de objetivos sobre `world.missions` y flags que ya existen; tarjetas para activadores y resultados; simulador de progreso; localizador de acciones que producen cada flag. Evitar escribir otro motor de secuencias paralelo.

**Etapa 3 — Arquitectura de archivo y traducción:** fuente descompuesta, validador y empaquetador con formato `sofia-dialogues` compatible; `es/ui.json` y `es/plato.json`; español sin traducción aún; test de equivalencia de JSON compilado al anterior; internacionalización progresiva.

**Etapa 4 — Actividades del minicore:** tipo `activity` y `launchMinigame` enlazado por ID, resultado a flags existentes; no programar minijuegos nuevos dentro del editor de diálogos.

**NO** reescribir `main.ts`, `Universe`, `ContentPlayer`, los cinco interiores de Platón, los scripts de perfil ni el motor radial para implementar estas pantallas.

## 8. Decisiones que debe ratificar el autor antes de migrar fuentes

- El editor presenta **conversaciones por NPC/escena/misión** y cuenta automáticamente; no se pide configurar «cuántos diálogos hay» a mano.
- La lógica se guarda por **ID de conversación**, con variantes por requisitos; NO un archivo entero por línea.
- De momento se conservará el contrato de importación/exportación existente; la separación física de archivos llegará mediante compilación/validación.
- El español es idioma inicial, con catálogo de UI separado y estructura lista para localización; sin duplicar flujos por idioma.
- Los cambios de autoría se guardan en navegador; para escribir en GitHub se usa exportación/aplicación/commit, o una futura integración autenticada explícita.
- Cada mundo documentará personajes, escenas, misiones, conversaciones, acciones y enseñanzas; el **pergamino** consume evidencias de misiones y actividades, no el texto libre de diálogo como «aprobado».

**Fuentes en repo:** [Diálogos por escena](DIALOGOS-POR-ESCENA.md), [Diálogos y niveles](DIALOGOS-Y-NIVELES.md), [Editor y acontecimientos](EDITOR-Y-ACONTECIMIENTOS.md), [Motor y rutas](MOTOR-Y-RUTAS.md), [Evolución modular](EVOLUCION-MODULAR.md). Referencia externa de UX: TyranoBuilder (componentes de diálogo/variables), GDevelop (eventos con condiciones y acciones), Ren'Py (separación de guion y traducciones), **sin adoptarlos como motores**.


## 9. Decisión confirmada: «Genially para crear mundos jugables»

**Aprobación del autor, 23-11-2026.** El modelo mental principal del editor será **crear una presentación interactiva como en Genially**; esta analogía define la EXPERIENCIA DE EDICIÓN, no el motor de ejecución.

| Genially | Sofía y los mundos de las ideas |
|---|---|
| Presentación | Planeta/mundo de un filósofo |
| Diapositiva | Escena o habitación lateral; la superficie circular también es una escena especial |
| Fondo de diapositiva | Imagen base del escenario; geometría/colliders configurados independientemente |
| Elemento insertado | NPC, objeto, cadena, antorcha, señal, puerta o zona invisible |
| Interactividad del elemento | Lista ordenada de acciones y condiciones |
| Ir a diapositiva | Ir a habitación interior/volver a escena/salir a superficie; preservar punto de retorno |
| Mostrar texto | Examinar, conversación o comentario con imagen/retrato |
| Plantilla | Patrón reutilizable de habitación y/o misión |
| Vista previa | Probar la escena, incluyendo estado de misión simulado |

**Diferencia indispensable:** la escena es **jugable**. En lugar de pulsar el elemento de forma arbitraria, Sofía camina hasta el NPC/objeto, se aproxima y lo examina/habla/activa; el editor muestra la superficie caminable y las colisiones. Sin destruir la lógica de navegación radial exterior, interiores laterales, controles táctiles landscape o guardados.

### 9.1 Flujo de creación que debe parecer sencillo
1. «Nueva escena» → seleccionar plantilla (habitación plana, ascenso, diálogo, exploración, etc.) → importar/cambiar imagen y nombre.
2. «Añadir elemento» → elegir NPC existente o nuevo, objeto de biblioteca, zona clicable, puerta, antorcha o señal → colocarlo en el lienzo.
3. Tocar elemento → inspector **¿Qué ocurre al interactuar?** con botones grandes: **Conversar**, **Examinar**, **Activar**, **Ir a otra escena**, **Recoger**, **Iniciar actividad** (futuro).
4. Para una secuencia, añadir acciones en orden; permitir moverlas, desactivarlas temporalmente, duplicar y eliminar con validación. Cada acción admite «Solo si…» y «Después…», eligiendo condiciones/resultados por **nombre legible** de un catálogo.
5. «Conectar escena» → elegir destino de una lista de escenas existentes y punto de llegada; ofrecer regreso automático. No requerir cables ni editar rutas manualmente.
6. «Probar» → jugar la escena con marcas de progreso simuladas. Ver si NPC habla, cadena libera, puerta abre, misión avanza y regreso conserva estado.
7. «Guardar» → versión local validada; «Exportar/Publicar» → archivo compatible y flujo de revisión/incorporación GitHub existente, no publicación automática engañosa.

### 9.2 La misión atraviesa varias escenas; no es una diapositiva más
Una misión es una **secuencia de pasos con condiciones y eventos** sobre varias escenas. Panel separado «Mi misión» con línea temporal de tarjetas:
- Hablar con NPC → investigar objetos → cambiar evento «sombras comprendidas» → volver a NPC → aceptar misión/acompañamiento → abrir cadenas → desbloquear puerta.
- Debe permitir reordenar pasos cuando la lógica lo permita, reconocer dependencias, detectar pasos imposibles e ir desde cada paso al NPC, objeto y escena relacionados.
- La misma escena puede participar en varias misiones y un NPC puede hablar en múltiples escenas. El motor no debe duplicar su identidad ni su diálogo solo porque cambia la aparición.

### 9.3 Inspector unificado de objeto / NPC
Al seleccionar cualquier recurso:
- **Aspecto:** sprite, escala, posición y orientación; para planeta radial, ángulo/apoyo; para habitación lateral, coordenadas.
- **Movimiento / accesibilidad:** suelo, hitbox, distancia de interacción, barrera/puerta/camino; mostrar vista de colisión sin adivinar el suelo desde la imagen.
- **Interacciones:** título visible, «al acercarse / al tocar / al entrar en zona / al volver», requisitos, acciones ordenadas, repetición y mensaje si bloqueado.
- **Conversaciones:** seleccionar existente o crear; biblioteca filtrable por NPC/escena/misión, entradas condicionales por progreso, contadores calculados.
- **Destinos:** selector de escenas/mundos válidos, advertencia de referencias rotas y punto de retorno.
- **Seguimiento:** «Dónde se usa», «Qué evento dispara», «Qué se desbloquea» y vista previa.
- **Estado:** identidad permanente (characterId) separada de sprite e instancia, opción para personaje temporal, variaciones por escena y conservación de progreso.

### 9.4 Plantillas de autoría prioritarias
**Plantillas simples**, configurables en JSON, no motores exclusivos: «Conocer NPC», «Investigar varios objetos», «Aceptar misión», «Convencer NPC con evidencias», «Liberar/activar mecanismo», «Abrir puerta por requisito», «Conseguir pergamino» y «Regresar para concluir». Instanciar plantilla genera objetos, referencias, acciones y flags **con IDs únicos y validados**; el usuario cambia nombres, textos, sprites, escena y requisitos. No inventa automáticamente diálogos filosóficos completos.

### 9.5 Alcance y orden de construcción decidido
- **P0 / obligatorio:** preservar el juego, escenas, diálogos, eventos y editor actuales; no introducir una segunda fuente de verdad.
- **P1:** experiencia tipo Genially dentro de `/#/edicion` y paneles actuales: insertar → seleccionar → interactuar → previsualizar; catálogo de NPC con contadores y vistas por escena.
- **P2:** línea temporal visual de misiones reutilizando `world.missions`, `requires`, `reward.flags`, `interactions`; añadir plantillas y validación de dependencias.
- **P3:** organizar/exportar diálogos por mundo, preparar localización separada para interfaz y textos y añadir publicación más asistida, conservando `sofia-dialogues` y `apply:project`.
- **P4:** integrar el framework de minijuegos mediante IDs de actividad/resultado, **sin** rediseñar el editor.

### 9.6 Criterios de aceptación para una primera demostración
Sin editar manualmente ningún archivo TS, desde el editor visual el autor debe poder:
1. Abrir «Platón → Sala B», seleccionar el prisionero y ver todas sus conversaciones, escenas y variantes de estado con contadores.
2. Añadir un NPC genérico con una identidad nueva y otra instancia de un NPC ya existente sin confundirlos.
3. Crear conversación con opciones «aceptar / no aceptar», que registre un evento concreto solo en la rama correspondiente.
4. Colocar objeto «cadenas», vincular condición al evento anterior y abrir puerta a D solo después de la aceptación.
5. Probar el recorrido con varios estados temporales y comprobar qué conversación se elige, sin alterar la partida real.
6. Exportar e importar el resultado conservando IDs, traducciones futuras y enlaces; al publicar, que `npm test` y `npm run build` sigan funcionando.

**Límite:** no construir un clon general de Genially, un editor de animación profesional ni un nuevo intérprete de guiones. Reutilizar escenas Phaser, renderizador, validadores y flujos reales.

## 10. Reparto de trabajo recomendado
- **ChatGPT en conversación:** definir la experiencia pedagógica, reglas, flujo visual, casos límite, criterios de aceptación, estructura de datos, diálogos y revisar el trabajo. Mantener documentos y decisiones coherentes.
- **Codex trabajando en el repositorio:** leer archivos vivos, realizar cambios en módulos TypeScript y tests, ejecutar compilación y pruebas de navegador, mostrar el diff y corregir fallos. Tratar los documentos como especificación, **no** como licencia para reescribir el juego.
- **Autor:** probar cómodamente en móvil y decidir si el editor realmente se siente como Genially.

**No son exactamente lo mismo:** ambos pueden razonar y producir código, pero para una tarea de implementación y validación continua en el repositorio suele convenir Codex; para visión de producto, pedagogía, documento completo y revisión crítica es útil empezar en conversación. La implementación debe verificarse, nunca darse por terminada solo por existir una especificación.

# Estudio de historias — primera entrega funcional

Implementación del 23 de noviembre de 2026 de [la propuesta aprobada](ARQUITECTURA-AUTORIA-DIALOGOS-MISIONES-I18N.md). Se amplía el motor existente; no se sustituyen Phaser, el intérprete, los guardados ni el descriptor de los mundos.

## Acceso y recorrido

En Mundos y escenas aparecen las pestañas **Escenario · Personajes · Diálogos · Misión**. Probar escena sigue en la barra exterior del lienzo; las conversaciones tienen su propia prueba contextual.

- `/#/personajes?world=plato&scene=prisioneros`: ficha del prisionero y personajes relacionados.
- `/#/dialogos?world=plato&scene=prisioneros`: conversaciones de B, incluidas las que se activan por eventos.
- `/#/misiones?world=plato&scene=prisioneros`: objetivos, productores y condiciones del mundo.
- `/#/edicion?world=plato&scene=prisioneros`: composición y prueba jugable.

El guardado muestra su estado y la navegación espera las escrituras pendientes para no exportar una cadena anterior al cambiar rápidamente de vista.

El aspecto global continúa en `/#/apariencia`; no se mezcla con el contenido narrativo.

## 1. Personajes y apariciones

Cada ficha cuenta conversaciones únicas, turnos totales de esas conversaciones y variantes condicionales. Los turnos incluyen a todos los interlocutores de la conversación, no solo al NPC. Las apariciones colocadas y las escenas de acompañamiento se indican por separado. Los contadores se calculan, no se escriben a mano.

Puedes filtrar por nombre, escena u objetivo relacionado. «Dónde aparece» abre la aparición correspondiente; los enlaces de conversación llevan al guion y los de variante a su nodo concreto. Si un personaje habla en un evento iniciado por otro, también figura en su ficha.

«Añadir personaje a esta escena» permite:

1. Crear una identidad nueva con nombre y recurso visual; se asignan IDs estables automáticamente.
2. Seleccionar una identidad existente y crear otra aparición de ella en otra habitación.
3. Abrir el escenario con la nueva aparición seleccionada para ajustar posición y aspecto.

No se copia automáticamente el comportamiento de una aparición a otra ni se duplica la identidad porque comparta imagen. La posición inicial es un punto de trabajo que el autor debe ajustar en el lienzo.

Al seleccionar un NPC en el escenario, el inspector de interacciones se sincroniza con él y muestra sus contadores y enlaces a la ficha y al guion. Los observadores/listeners se limpian al cambiar de escena.

## 2. Escribir por momentos, no por claves técnicas

El índice muestra títulos legibles. Abrir una conversación centra la vista en el guion; «Volver al índice» recupera la lista. Se conserva añadir turnos, alternar interlocutores, decisiones, bifurcaciones y eliminación de textos con confirmación/reconexión.

«Añadir momento / variante» permite nombrar una situación, por ejemplo «Al regresar después del primer ascenso», escoger acontecimientos requeridos y prohibidos, y elegir su prioridad. Se crea un nodo nuevo sin sustituir los anteriores. Después se escribe su contenido en el editor habitual.

«Cuándo aparece / prioridad» modifica una variante existente conservando su nodo y textos. Se sigue escogiendo la primera entrada válida del arreglo `entries`; si ninguna coincide se utiliza `start`. No se cambia el intérprete ni el orden anterior por defecto.

Las condiciones tienen nombres y búsqueda. Si el mismo acontecimiento se exige y se prohíbe se rechaza el guardado. Las versiones y JSON avanzados están plegados; no se necesita escribir IDs para la autoría normal.

Las conversaciones vinculadas no se borran desde el índice. Los borradores sin uso se eliminan con confirmación y ofrecen Deshacer mientras permanezcas en esa vista. No se elimina progreso ni se renombran flags.

## 3. Objetivos y línea temporal

La vista Misión utiliza `world.missions`: hoy es una lista de objetivos del mundo, no una nueva colección independiente de campañas. Cada tarjeta muestra:

- Título, instrucción e identificador de progreso existente.
- Acciones o respuestas que producen ese resultado, con enlaces al activador o texto.
- Conversaciones condicionadas por ese resultado.
- Dependencias directas localizadas y advertencias si no se encuentra productor.

Se puede editar el título y la instrucción sin cambiar la marca; mover una tarjeta no modifica sus requisitos. Se impide un movimiento que contradiga una dependencia directa detectada. La revisión es estática y parcial: no es una demostración formal de que todas las rutas sean completables.

El simulador marca objetivos temporales y prepara ese estado en el editor de escenas; desde allí se pulsa Probar. No escribe progreso real ni certifica que todas esas marcas puedan obtenerse en ese orden jugando.

## 4. Plantilla de aceptación y mecanismo

En una habitación, desde Misión:

1. Añadir primero un NPC sin interacción, para no reemplazar historias existentes.
2. Abrir «Plantilla: aceptar → activar mecanismo → abrir entrada».
3. Dar nombre y elegir NPC y habitación de destino.
4. Se generan una conversación genérica editable con Sí/No, dos objetivos, un mecanismo y una puerta condicionada. Cada elemento tiene ID nuevo.
5. Ajustar las zonas invisibles al dibujo existente y escribir el guion propio.
6. Probar: No no registra aceptación; Sí la registra; activar el mecanismo habilita la puerta. El historial normal permite regresar.

Es una plantilla de autoría, no contenido filosófico terminado ni arte nuevo. No escribe una experiencia de Platón automáticamente. La superficie radial conserva su editor y no usa esta plantilla rectangular.

## 5. Interacciones ordenadas

El inspector «¿Qué ocurre al interactuar?» conserva acciones existentes y permite reordenar, duplicar, quitar con confirmación y desactivar temporalmente. Usa nombres legibles para requisitos y resultados. Los destinos de Conversar muestran el título del diálogo.

Hay dos niveles distintos:

- Requisitos de la interacción: bloquean la cadena completa y muestran su mensaje de bloqueo.
- «Solo si…» de un paso: si no se cumple, ese paso se omite y continúa el siguiente. Desactivar un paso hace lo mismo.

No se ejecuta código arbitrario. Las acciones siguen siendo los tipos permitidos del motor. Cambiar el primer comportamiento conserva la cola, recompensas no expuestas y condiciones por acción. `record` permite registrar una marca sin inventar un mensaje.

## 6. Fuente de conversaciones y preparación de idiomas

El botón «Exportar guion y textos por idioma» crea un paquete **`sofia-dialogue-sources` v1**, con:

- `flow`: un paquete compatible `sofia-dialogues`, con referencias estables de texto.
- `locales.es`: los textos españoles extraídos del contenido actual.
- Otros catálogos conservados, si se importaron previamente.

`compileDialogueSources` recompone el contrato actual, valida referencias y aplica español como fallback para claves ausentes. Comprueba los parámetros `{nombre}` y conserva identidades lógicas; Sofía puede tener un nombre mostrado traducido sin perder su papel como interlocutora.

Importar conversaciones acepta tanto el paquete anterior como esta fuente nueva. La recompilación española del mundo publicado de Platón produce datos equivalentes, sin renombrar misiones, acciones o IDs. El español se regenera desde los textos actuales del editor; no hay dos copias españolas que editar por separado.

Este paquete transporta conversaciones y vínculos primarios compatibles. Para escenas nuevas, misiones, eventos, imágenes y cadenas completas se usa **Exportar proyecto**. Omitir una conversación de un paquete importado no la elimina silenciosamente del mundo. Los nodos editados siguen necesitando destinos válidos.

No se ha migrado el repositorio a `content/worlds/…`, ni se tradujo el juego, ni se añadió un selector global de idioma. El catálogo completo de botones/menús y la edición visual de traducciones siguen siendo trabajo posterior. La separación disponible ahora es el exportador/compilador de conversaciones, validado antes de una migración masiva.

## 7. Extensiones compatibles del contrato

Campos opcionales, conservando el formato v1 y sus IDs:

- `Action.enabled`, `Action.requires`, `Action.excludes`.
- `Dialogue.entries[].label` para nombrar momentos sin cambiar su nodo.
- `DialogueNode.speakerId` para roles globales `sofia` / `narrator`; los NPC mantienen `characterId`.
- `WorldDefinition.dialogueLocales` para conservar catálogos importados en la exportación completa.

Las fuentes nuevas están en `src/worlds/story-studio.ts` y `dialogue-sources.ts`. Las pantallas están en `src/engine/story-studio.ts`, `dialogue-variant-editor.ts` y los editores existentes. No hay un motor exclusivo por filósofo.

## 8. Validación

- `tests/story-studio.test.mjs`: contadores, identidades/apariciones, aceptación y rechazo, dependencias, variantes, equivalencia de fuente española, fallback, parámetros y conservación de condiciones.
- `tests/browser_story_studio.py`: flujo completo con formularios, prueba real de puerta/mecanismo, importación/exportación, variante, progreso intacto y móvil horizontal.
- Capturas en `captures/estudio-ficha-personajes.png`, `estudio-linea-mision.png`, `estudio-guion-ramificado.png` y `estudio-personajes-movil.png`.
- El toque es emulado; no se probó un teléfono físico.

## Trabajo posterior de la propuesta

Agrupaciones de varias misiones por mundo, las otras plantillas del catálogo, archivo/desvinculación avanzada de contenido usado, análisis completo de accesibilidad lógica, catálogo global de interfaz por IDs y herramientas visuales de traducción. El framework externo de minijuegos se conectará mediante los IDs de actividad existentes, sin crear minijuegos nuevos aquí.

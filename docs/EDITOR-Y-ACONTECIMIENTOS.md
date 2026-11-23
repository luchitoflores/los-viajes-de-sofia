# Edición de escenas, textos y acontecimientos

## Un espacio de edición

En los mundos configurables, el botón de edición desde el juego abre `/#/edicion` con el mismo mundo y habitación. El editor superpuesto antiguo queda solo como compatibilidad de prototipos. La superficie circular conserva su física y herramientas radiales; los interiores comparten las herramientas rectangulares.

Arriba están **Cambiar fondo / configurar escena**, la indicación **Modo edición** y las herramientas **Seleccionar**, **Objeto/NPC**, **Suelo/camino**, **Obstáculo**, **Escalera/pendiente** y **Entrada**. No tapan el lienzo.

- Dibuja arrastrando. Un clic suelto ya no crea rectángulos mínimos por accidente. Esc cancela.
- Selecciona una zona para arrastrarla o usar sus ocho tiradores. **Seleccionar solo zonas** y la lista permiten elegir áreas superpuestas o pequeñas.
- El inspector cambia tipo, posición, tamaño y los apoyos de una pendiente. El apoyo izquierdo es independiente del derecho, para ajustar el recorrido dibujado.
- Los suelos nuevos tienen prioridad sobre el suelo base. Conecta sus alturas mediante pendientes; el juego mantiene el límite contra saltos automáticos entre apoyos desconectados. No se detecta el terreno desde la imagen.
- Una **Entrada** puede conectarse con otra habitación, el regreso por el historial o la superficie. La conexión crea un objeto invisible alineado con la zona. Mover/redimensionar la zona actualiza su interacción; eliminarla retira esa entrada. Cambiar su tipo deja de tratarla como puerta. El fondo permanece intacto.
- **Probar escena** reconstruye las colisiones y conexiones con los datos actuales; la prueba no escribe progreso jugado.

## Conversaciones sobre el escenario

Selecciona un NPC u objeto y pulsa **Conversaciones del objeto seleccionado**. Se abre su conversación; si todavía no tiene, prepara una nueva con ese objeto como vínculo. El compañero animado conserva su acceso desde la lista de conversaciones de cada habitación.

El formulario ahora tiene una secuencia de textos. **Añadir turno** extiende una continuación lineal e intercala Sofía y el anfitrión como propuesta; puedes cambiar quién habla. Para una decisión utiliza **Añadir texto a esta respuesta**, que crea y conecta directamente el camino elegido. Los destinos anteriores y las recompensas se conservan al extender.

Los pasos se distinguen como:
- **Diálogo**: una continuación, por toque o Enter.
- **Decisión**: varias respuestas; registra automáticamente cuál se escogió.
- **Bifurcación**: varias respuestas con continuaciones y resultados propios. Las ramas se conectan explícitamente y sus resultados sirven como condiciones posteriores.

Las secuencias lineales sin entradas condicionadas se pueden reordenar arrastrando. Los grafos ramificados conservan sus conexiones explícitas. El borrado de texto y de respuesta pide confirmación. Al quitar un texto eliges dónde reconectar sus entradas; los inicios y versiones nunca quedan apuntando a un texto inexistente. Siempre se conserva al menos un texto.

## Acontecimientos, objetivos y puertas

`/#/eventos` muestra un registro por mundo: nombres legibles, tipo y dónde se produce cada resultado. Puedes registrar un acontecimiento, un estado o un objetivo. Crear el nombre no lo cumple; seleccionarlo en **Resultados de esta respuesta** hace que ocurra al elegir/continuar esa respuesta. También puedes **habilitar una puerta ya conectada**. Se utiliza el sistema común de requisitos, sin ejecutar scripts arbitrarios.

Una decisión/bifurcación registra su respuesta con un identificador estable. Al responder de nuevo se sustituye únicamente el registro automático de las alternativas de ese mismo paso. Los objetivos logrados y puertas habilitadas no se deshacen automáticamente por repetir una conversación.

En cada ficha, **Condiciones y repetición de este encuentro** configura lo que debe haber ocurrido y lo que todavía no debe haber ocurrido. Así, “antes del rescate” se expresa excluyendo “prisionero liberado”. Para exigir una conversación antes de abrir una puerta, registra su finalización y úsala como requisito de la puerta. No hay predicción de acontecimientos futuros.

Las conversaciones de objetos pueden repetirse al tocar o una vez por partida en esa aparición. Los encuentros automáticos pueden ocurrir una vez por partida o una vez en cada visita. Las marcas se guardan al completar, no por abrir el texto. Las versiones de un diálogo siguen conservando sus entradas, prioridades y recompensas.

Los objetivos registrados pertenecen al mundo editado. La ruta y los desbloqueos de Historia siguen definidos en `worlds/story.json`; crear un objetivo no cambia automáticamente esa ruta.

## El prisionero que regresa abajo

La presencia del compañero y sus conversaciones son responsabilidades distintas. `journey.companion` conserva las condiciones de liberación, estancia y salida. El nuevo mapa opcional `companion.encounters` permite conversaciones/reglas diferentes por habitación sin cambiar esas condiciones de seguimiento.

Se conserva el mismo personaje durante la liberación, ascenso, regreso a B y decisión. Si se queda, desaparece el seguimiento y queda la aparición de B para volver a hablar. Si sale, finaliza en E. Nunca viaja como compañero fuera de la caverna.

## Proyecto exportado del autor

Se validó e incorporó `sofia-proyecto-motor (1).json`: fondos de cinco habitaciones, posiciones, zonas, biblioteca y aspecto (letra 14). Se conservan las imágenes y sus rutas propuestas, y los nombres nuevos de las conversaciones publicados después de esa exportación. Los otros mundos sin cambios no se reescribieron; Sartre conserva sus bytes originales.

La copia de seguridad y el JSON fuente están en `.project-backups/2026-11-23T02-12-40-570Z-d06966a9/`, fuera del repositorio. El plan validado está en `captures/author-import-plan.json`. Se ajustaron los dos apoyos antiguos de la escalera junto al descanso Y=400 para evitar discontinuidades. La compatibilidad reconoce ese caso exacto en borradores antiguos; respeta apoyos personalizados explícitos y no borra los borradores del navegador.

Los borradores y ajustes del editor se guardan localmente. **Exportar proyecto** incluye las regiones, conexiones, registros, condiciones, ramas e imágenes. Las partidas permanecen independientes. Los nuevos campos de datos son opcionales; se conservan los proyectos anteriores.

## Módulos

- `zone-geometry.ts` y `scene-toolbox.ts`: geometría y herramientas.
- `zone-doors.ts`: conexión validada de entradas pintadas.
- `story-events.ts`: registro, resultados y operaciones de turnos.
- `dialogue-authoring-controls.ts`: secuencia, tipos, borrado y resultados.
- `encounters.ts` y `encounter-editor.ts`: condiciones y repetición.
- `story-event-editor.ts`: registro visual por mundo.

El motor narrativo sigue siendo común. `record` es una acción de datos silenciosa para registrar un resultado, no un nuevo motor ni un LLM.

Los recuadros del lienzo muestran el nombre/identificador y una explicación de su función (camino, obstáculo, pendiente, entrada, evento u objeto). Estas etiquetas solo se muestran al editar y no capturan los clics del escenario.

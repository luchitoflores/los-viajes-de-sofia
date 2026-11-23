# Indicadores de conversación — 23 de noviembre de 2026

- Se elimina el anillo de los pies. El icono de mensaje queda sobre la cabeza, siguiendo la cámara y la orientación radial.
- Un NPC solo muestra indicador si su comportamiento habilitado contiene una conversación pendiente. Decoración, personajes sin conversación y comportamientos bloqueados no lo muestran.
- Terminar una intervención registra su entrada y versión en el progreso del planeta. Las repeticiones siguen accesibles tocando el personaje, pero no se anuncian de nuevo. Un evento que habilita otra entrada devuelve el indicador. Una revisión del texto también se reconoce como contenido nuevo.
- Las conversaciones empezadas y sin terminar siguen pendientes. El punto de partida se conserva al guardar/reanudar. Las presentaciones ya completadas de partidas antiguas se consideran leídas; otros diálogos antiguos sin historial pueden anunciarse una vez, porque no se inventa un historial de lecturas.
- Se conservan todos los actores como anclas de bocadillos aunque no tengan indicador. Ocultar el icono no oculta al personaje ni impide volver a hablarle.
- El acercamiento a NPC en interiores se detiene con mayor separación para evitar superponer las figuras. No se convierte automáticamente a cada interlocutor en una barrera permanente: los bloqueos narrativos siguen dependiendo de requisitos explícitos en puertas/acciones/eventos, y los obstáculos de la geometría del escenario. Un saludo no crea un bloqueo nuevo.

## Qué corresponde al editor visual y qué a la historia

La posición del indicador, icono, color y posible anillo son presentación visual y podrían compartir un apartado global de aspecto. La disponibilidad, lectura pendiente, obligatoriedad y requisitos pertenecen al comportamiento/encuentro narrativo. Son responsabilidades distintas. Esta corrección no añade controles nuevos de tema al editor: el autor solo consultó sobre esa posibilidad.

## Persistencia y comprobación

El progreso admite los campos opcionales `dialogueRead` y `dialogueStarts`, sin cambiar los IDs de mundos, eventos o respuestas. Los guardados anteriores siguen cargando. La lectura no altera recompensas ni rutas de historia. Las pruebas puras comprueban lectura, entradas nuevas, versiones, interrupción, persistencia e introducciones antiguas.

Comprobación de esta versión: 83 pruebas de datos y compilación TypeScript/Vite correctas. `browser_conversation_pending.py` verifica posición sobre la cabeza, ausencia de anillo, lectura persistente, evento nuevo, clic/toque y separación de aproximadamente 105 unidades. `browser_conversation_return.py` verifica el encuentro obligatorio y la decisión posterior del compañero. La regresión completa de la caverna pasó ambos desenlaces y segundo ascenso; informe en `captures/conversation-cave-regression.txt`. El toque es emulado; no se probó un teléfono físico.

# Validación del motor común — 2026-11-21







- `npm run build`: TypeScript estricto y Vite aprobados.



- `npm test`: 21 pruebas aprobadas, 0 fallos.



- `tests/browser_universe.py`: encuentro inicial obligatorio, vuelta circular por toques, parejas, clasificación con ratón y dedo, decisiones y argumentos guardados, retorno, recarga, rutas al mismo planeta, importación de imágenes, exportación completa, rechazo de configuraciones inválidas, cambio entre dos definiciones sin código nuevo, selección concurrente y preservación de partidas anteriores. Incluye aislamiento de Deshacer y cambio de editor entre mundos nuevos y prototipos.



- `tests/browser_universe_mobile.py`: Chrome con viewport táctil 932×430; clasificación, controles del editor, ocultación del HUD y compañero presente al recargar dentro de un interior.



- `tests/browser_story.py`: recorrido original completo de la caverna y persistencia del compañero.



- `tests/browser_taps.py`: destinos por clic/toque, objetos pintados, tamaño estable, joystick, colisiones y zonas editables.



- `tests/browser_planet.py`: circunferencia en ambos sentidos, parada al soltar el teclado, conversaciones, recogida, retorno exacto, arrastre táctil y con ratón, propiedades, exportación/importación, deshacer y persistencia.







Los informes de estos cinco recorridos registran cero errores de navegador. Son contextos aislados de Chrome; no se modifica la partida del navegador personal.







## Informes y capturas auténticas







- `captures/universe-validation.json`



- `captures/universe-mobile-validation.json`



- `captures/story-validation.json`



- `captures/tap-validation.json`



- `captures/validation.json`



- `captures/atlas-por-autores.png`



- `captures/sartre-encuentro-inicial.png`



- `captures/sartre-clasificacion.png`



- `captures/sartre-decision-consecuencia.png`



- `captures/editor-mundo-configurable.png`



- `captures/sartre-clasificacion-movil.png`



- `captures/editor-universal-movil.png`







## Límites







Se probó toque emulado en Chrome, no un teléfono físico. El arte del caso Sartre es provisional. La ilustración completa de su geografía y las ampliaciones de contenidos siguen planificadas, no se presentan como terminadas. La definición sintética de otro autor se utilizó solo en el navegador de prueba y no se publica en el catálogo del proyecto.







La configuración de grafos y contenidos de actividades se prepara en JSON; el editor visual los asigna y compone sus escenarios. No se anuncia un editor gráfico de nodos o de animaciones arbitrarias terminado.







## Correcciones del universo y acompañantes — 2026-11-21



21 pruebas de lógica aprobadas. Chrome: recorrido de caverna completo, rescate hasta la salida, prisionero ausente al salir y al revisitar, Sócrates siguiendo en la superficie, igualdad de altura de referencia (118), persistencia tras recargar; sin errores JavaScript. Vista móvil emulada 932×430: Sartre guía en el café aun con una partida antigua con `freed=true`, ningún prisionero, clasificación mediante toque y controles del editor accesibles; sin errores JavaScript. No se ha probado un teléfono físico. Capturas y resultados: `captures/universo-mundos-restaurados.png`, `story-validation.json`, `universe-mobile-validation.json`.







Revisión final: TypeScript y Vite compilan. `tests/browser_guides.py` confirma cuatro imágenes sin solapamiento con sus nombres, entrada directa al mundo, Sócrates siguiendo, altura de referencia igual y diálogo mediante clic real sobre el guía móvil. Sin errores JavaScript. Captura adicional: `captures/sofia-filosofo-misma-altura.png`. Los filósofos se desplazan con su ilustración actual; aún no tienen un ciclo de marcha propio.







## Encuentros clave y creador visual — 2026-11-21



Esta versión sustituye el seguimiento del filósofo documentado en la revisión anterior por puntos de encuentro fijos. Compilación TypeScript/Vite y 25 pruebas de modelo aprobadas.







- `tests/browser_authoring.py`: mundo creado desde formulario, nombre y renombrado de objeto, biblioteca compartida desde el prototipo, importación de imagen con nombre propio, interiores anidados creados visualmente, objeto colocado mediante toque emulado, cambio de nombre/fondo y retorno por dos interiores conservado al recargar, autor duplicado rechazado y retroceso por la caverna antigua.



- `tests/browser_resource_transfer.py`: exportación de un objeto con recurso, importación en un perfil nuevo, imagen y paleta conservadas al recargar, actualización IndexedDB 1→2 sin eliminar los mundos previos.



- `tests/browser_universe_mobile.py`: filósofo estático en el café, ausencia del prisionero fuera de la caverna, clasificación táctil y controles del editor accesibles en vista móvil emulada 932×430.



- `tests/browser_story.py`: recorrido completo de lámpara, sombras, guardián, llave, liberación, ascenso y salida. Prisionero limitado al rescate, filósofo fijo en su punto de encuentro, retroceso secuencial y persistencia al recargar.







Los recorridos registrados no mostraron errores JavaScript. Informes: `captures/authoring-validation.json`, `resource-transfer-validation.json`, `universe-mobile-validation.json`, `story-validation.json`. Capturas reales: `captures/editor-interiores.png` y `captures/caverna-regreso-secuencial.png`. No se probó un teléfono físico. Los fondos del creador son recursos reutilizados y provisionales; el editor gráfico de todos los nodos de diálogo y actividades todavía no existe.







La pasada final del creador también comprobó los cambios de escena con el panel anterior oculto durante la carga. Se evita abrir formularios del escenario anterior mientras se prepara el nuevo; el recorrido completo del creador volvió a pasar sin errores JavaScript.







## Generador, seis planetas y NPC — 2026-11-21







TypeScript sin errores, 33 pruebas de modelo aprobadas y lote validado con seis planetas canónicos. El SHA-256 de `public/worlds/sartre.json` permanece `69F7A16ED882DF14FE5D6DF0A9F3820821E028F950913192CF7DC70E092B37FF`.







Pruebas reales en Chrome:







- `browser_templates.py`: los cuatro nuevos planetas recorridos 360° en ambas direcciones; encuentro obligatorio; suelo 560 en 1280×720; interiores, escaleras de Hegel en ambos sentidos, salas de Kant, Clara en dos escenas, portal Camus–Sartre y regreso tras recargar.



- `browser_npc_editor.py`: Sísifo y Marco comparten imagen con identidades independientes; cambiar Sísifo no cambia Marco; colocación por toque; edición de diálogo y texto progresivo; habitación nueva de 720 en Sartre sin alterar las anteriores; ascensor sube, conserva apoyo al recargar y baja; conexiones mediante instrucciones y regreso exacto entre habitaciones de mundos distintos.



- `browser_batch_mobile.py`: lote inválido no escribe mundos parciales; cuatro mundos importados en una operación conservando decisiones y progreso de Sartre; puerta, NPC y diálogo mediante toque emulado en vista 932×430.



- `browser_universe.py`: nueva pasada completa de Sartre, parejas, clasificación con ratón y toque, decisión argumentada, guardado, dos rutas al mismo planeta, exportación/importación, rechazo de datos inválidos y compatibilidad del editor antiguo.



- `browser_story.py`: secuencia completa de la caverna, rescate limitado hasta la salida, filósofo fijo, retroceso secuencial y recarga.



- `browser_resource_transfer.py`: exportación de recursos, importación en perfil nuevo, persistencia de imágenes y migración IndexedDB 1→3 conservando el mundo previo.







Todos esos recorridos finalizaron sin errores JavaScript. Informes en `captures/templates-validation.json`, `npc-editor-validation.json`, `batch-mobile-validation.json`, `universe-validation.json`, `story-validation.json` y `resource-transfer-validation.json`.







Capturas auténticas: [seis planetas](../captures/seis-planetas-genericos.png), [escaleras de Hegel](../captures/hegel-dos-niveles.png), [ascensor](../captures/ascensor-generico.png), [Kant](../captures/kant-sala-maximas.png), [Heidegger](../captures/heidegger-temporalidad.png), [diálogo móvil](../captures/camus-dialogo-movil.png).







Límites: arte reutilizado provisional, especialmente Hegel y Heidegger; instrucciones naturales limitadas a conexiones documentadas; respuestas de diálogo editadas como JSON; caverna original conservada mediante compatibilidad, sin migración completa de sus diálogos. No se añadieron minijuegos complejos. Toque emulado, sin prueba en teléfono físico.







## Embarque y vuelos — 2026-11-21







TypeScript y Vite compilan. Las 35 pruebas de modelo pasan; las dos nuevas comprueban que el puerto reutiliza la nave del autor y añade una válida a mundos antiguos sin modificar sus objetos.







`tests/browser_spaceflight.py` completó embarque, selección, vuelo, aterrizaje y desembarque en Camus, Hegel, Kant, Heidegger, Sartre y Platón. Alternó clic real y toque emulado; comprobó cancelación del embarque, bloqueo de controles, altura constante, encuentro inicial y conservación de los seis encuentros tras recargar. Sin errores JavaScript.







`tests/browser_spaceflight_edges.py` comprobó vista móvil emulada 932×430, movimiento reducido, omisión de la animación mediante toque, recuperación ante un destino con carga fallida, controles posteriores y conservación de banderas, actividades, respuestas y decisiones anteriores. Sin errores JavaScript. No se probó un teléfono físico.







Informes: `captures/spaceflight-validation.json` y `captures/spaceflight-edges-validation.json`. Capturas auténticas: [vuelo](../captures/sofia-vuelo-entre-mundos.png), [aterrizaje](../captures/sofia-aterrizaje-camus.png) y [vuelo móvil](../captures/sofia-vuelo-movil.png). El SHA-256 publicado de Sartre continúa sin cambios. La nave y la cabina reutilizan los recursos ilustrados existentes; se implementa una secuencia animada, sin pilotaje manual. Uso y arquitectura en [NAVE-Y-VIAJES.md](NAVE-Y-VIAJES.md).







### Corrección: una sola nave







La prueba ampliada detectó una segunda nave en Sartre: su objeto original tenía interacción de examen y no se reconocía como puerto existente. Se reutiliza ahora esa nave, conservando su ID, aspecto y ubicación, y se normalizan los duplicados en ejecución. El archivo publicado de Sartre no se modifica. Además, la nave de la superficie despega y desciende realmente; la Polis ya no hornea una copia estática en el escenario.







Compilación TypeScript/Vite y 36 pruebas de modelo aprobadas. La nueva pasada completa de `browser_spaceflight.py` verificó una sola nave visible y una piloto durante el aterrizaje en los seis planetas, despegue de la nave de superficie, desembarque posterior y progreso tras recargar. Sin errores JavaScript. El informe incluye `single_ship_launch_and_landing: true` en cada destino. La pasada de casos límite también conservó recuperación de carga fallida, omisión táctil y movimiento reducido. Clic y toque emulado; sin teléfono físico.







Captura auténtica del descenso sin otra nave estacionada: [misma nave aterrizando](../captures/sofia-misma-nave-aterrizando.png).







## Modos, guardado y conversaciones elegidas — 2026-11-21







TypeScript/Vite compilan; 40 pruebas de modelo aprobadas. Se validan la ruta, sus marcas implementadas, el bloqueo de etapas futuras, la conservación de claves antiguas para Libre y la orientación en los cuatro cuadrantes radiales. El lote de seis mundos también pasa `validate:worlds`.







`browser_play_modes.py` completó en Chrome:







- Llegada en nave a Hegel sin diálogo automático, desembarque a distancia de interacción y presentación por E. Clic desde el otro lado orienta correctamente al filósofo y a Sofía.



- Guardado manual, recarga y recuperación de la posición exacta de superficie.



- Cambio a Historia sin borrar Libre, inicio en Platón y destinos posteriores deshabilitados.



- Carga de una partida previa con la caverna completada para verificar la apertura de Kant. Esa preparación es una fixture de guardado; no se presenta como una ejecución completa de la campaña de Historia.



- Recorrido real de la etapa de Kant: presentación por toque, Elena, notas, habitación moral y diálogo del deber. Al completar sus objetivos se abre Hegel y Heidegger permanece bloqueado.



- Guardado y recarga de la posición interior; NPC y Sofía mirándose durante la conversación.



- Regreso a Libre conservando su mundo, posición y marcas, con los seis destinos disponibles.







Informe: `captures/play-modes-validation.json`. Sin errores JavaScript. Hubo clic real y toque emulado; no teléfono físico. Capturas auténticas: [selector de modos](../captures/modos-historia-libre.png), [interlocutores de frente](../captures/personajes-frente-a-sofia.png) y [ruta de Historia](../captures/historia-ruta-bloqueada.png).







La nueva pasada de `browser_story.py` completó de nuevo el juego original: biblioteca, lámpara, sombras, guardián, llave, liberación, compañero animado durante el rescate, ascenso, salida y conversación final elegida por el jugador. Mantiene el filósofo fijo y la partida tras recargar; sin errores JavaScript. Su entrada y cierre se adaptaron al selector de modos y a los encuentros manuales.







Límites: guardado local, sin nube; Historia es una ruta por objetivos de los contenidos existentes, con arte provisional. La presentación ya no se abre al aterrizar ni por cerrar menús, pero sigue siendo requisito de las actividades. Detalles: [MODOS-Y-GUARDADO.md](MODOS-Y-GUARDADO.md).







La pasada final de `browser_spaceflight.py` completó los seis viajes y sus encuentros explícitos, con una sola nave y una piloto durante los descensos y sin presentaciones automáticas. Conservó los seis encuentros y el progreso al recargar; sin errores JavaScript. `browser_spaceflight_edges.py` también pasó en vista móvil emulada: movimiento reducido, omisión mediante toque, recuperación de un destino fallido y conservación de avances y controles. Los informes de nave quedaron actualizados. El muestreo del descenso registra fotogramas de la escena para no depender de capturar un instante breve desde el proceso de prueba.







## Reinicios y candados — 2026-11-21







Compilación TypeScript/Vite y 45 pruebas de modelo aprobadas. Las cinco nuevas comprueban el aislamiento entre mundos y modos, conservación de diseños antiguos, reinicio de la caverna sin borrar visitas archivadas, restauración ante fallo de escritura y recuerdos de mundos con IDs de prefijos compartidos.







`browser_restart.py` pasó en la versión compilada de `http://127.0.0.1:4173/`, con partidas sembradas en un contexto de Chrome aislado. No reinició la partida real del autor. Comprobó:







- Cancelación sin borrar decisiones, y reinicio de Sartre conservando Kant, Historia y la caverna.



- Conservación de un mundo editado y un recurso propio en IndexedDB.



- Reinicio de Kant en Historia: Hegel vuelve a bloquearse conservando su decisión previa.



- Reinicio de Historia: solo Platón abierto, cinco candados, sin modificar Libre; composiciones de la Polis e interiores propios conservados.



- Vista 932×430 con toque emulado sobre un candado: sigue visible y no permite viajar.



- Libre sin candados y reinicio completo de ese modo sin afectar Historia ni el editor.



- Recarga posterior sin que el autoguardado restaure los avances borrados.







Sin errores JavaScript. Informe: `captures/restart-validation.json`. Capturas auténticas: [confirmación](../captures/confirmar-reinicio.png), [candados de Historia](../captures/historia-planetas-con-candado.png) y [vista móvil](../captures/candados-historia-movil.png). No se probó un teléfono físico. El candado es un icono propio de interfaz; las ilustraciones de los mundos existentes se conservan.







## Historia abre el mapa antes de entrar — 2026-11-21







TypeScript/Vite compilan y las 45 pruebas de modelo pasan. `browser_story_map.py` completó la validación en el servidor compilado `http://127.0.0.1:4173/` con un perfil de Chrome aislado:







- Inicio de Historia en el mapa, con cinco candados y Platón disponible; superficie precargada oculta y teclas sin mover a Sofía.



- Cancelación de reinicio desde el mapa devuelve al mapa, conservando la selección obligatoria antes de explorar.



- Selección de Platón, Sofía visible en la cabina durante el vuelo, descenso con una sola nave y una piloto, y desembarque cerca del filósofo sin diálogo automático.



- Recarga que vuelve al mapa y conserva la presentación ya completada.



- Partida de prueba con la caverna completada para habilitar Kant: toque emulado en vista 932×430 sobre Hegel bloqueado no entra; tocar Kant abierto reproduce vuelo y aterrizaje.



- Selección desde el atlas de Historia durante la partida también reproduce la llegada, aunque no se haya embarcado manualmente.



- Continuación del modo Libre conservada, cambio de Libre a Historia que abre el mapa y reinicio de Historia que vuelve a mostrar solo Platón abierto.







Sin errores JavaScript. Informe: `captures/story-map-validation.json`. Capturas auténticas: [mapa inicial](../captures/historia-inicio-en-mapa.png), [viaje](../captures/historia-entrada-vuelo.png), [primer desembarque](../captures/historia-primer-aterrizaje.png) y [mapa móvil](../captures/historia-mapa-movil-entrada.png). Clic real y toque emulado; no se probó un teléfono físico. Las fixtures y los reinicios se limitaron al perfil de prueba, sin alterar la partida del autor.







## Enter para avanzar — 2026-11-21







TypeScript y Vite compilan. `browser_dialogue_enter.py` pasó en Chrome sobre el servidor compilado 4173: Enter revela el texto progresivo sin elegir una respuesta, Tab permite escoger la segunda alternativa de Sartre y Enter la confirma una sola vez. Completa después la presentación mediante respuestas únicas y cuadros de Continuar. Los eventos repetidos no saltan pasos ni reabren una conversación recién cerrada.







La prueba también recorrió los cuadros originales: cerrar el descubrimiento de la lámpara con Enter, elegir una alternativa del prisionero con Tab/Enter y continuar. Una fixture de guardado con llave permitió verificar que «Abrir las cadenas» no se elige automáticamente cuando existe la alternativa de seguir investigando. La confirmación de reinicio conserva el foco nativo en Cancelar y Enter no borra la partida. Clic y toque emulado siguen funcionando. Sin errores JavaScript; no se probó un teléfono físico.







Informe: `captures/dialogue-enter-validation.json`. El teclado común se instala una sola vez desde `src/engine/dialogue-keyboard.ts`; no añade listeners por cada cuadro ni modifica las reglas de respuestas o recompensas.











## Rutas del motor y diálogo común — 2026-11-21







Esta sección sustituye la descripción anterior de botones Continuar: las conversaciones ahora avanzan al tocar el bocadillo o pulsar Enter. Solo las decisiones y las invitaciones a actividades muestran botones.







TypeScript y Vite compilan (`captures/core-build-log.txt`). Las 56 pruebas de modelo pasan, incluyendo intercambio de proyectos, validación de recursos, colisiones de rutas, respaldo/restauración de archivos y recompensas de preguntas (`captures/core-model-tests.txt`). Continúa el aviso de Vite sobre el tamaño del paquete.







`browser_core_workbench.py` pasó en Chrome con perfil aislado: carga directa de una escena de Platón, simulación sin alterar el guardado, descripción/nombre de objeto, imagen con nombre original y ruta propuesta, cadena conversación/portal, prueba y aplicación global del aspecto, edición del texto, banco de preguntas con retroalimentación y enlaces a usos, exportación/importación/recarga, rechazo de una importación inválida y ejecución final de pregunta seguida por portal al estudio de Kant. Se comparó el guardado original durante toda la autoría. Tooltip con ratón y pulsación táctil mantenida sin activar el objeto. Sin errores JavaScript. Informe: `captures/core-workbench-validation.json`.







La exportación auténtica de la prueba se validó con `npm run apply:project -- captures/core-project-export.json`; no se publicó la fixture en el proyecto real. La escritura y restauración se probaron en directorios temporales. Informe del comando: `captures/core-publication-check.txt`.







`browser_dialogue_enter.py`, `browser_activity_invitation.py` y `browser_dialogue_stage.py` pasaron: Enter, Tab, bloqueo de repetición, cancelación nativa de reinicio, invitación Sí/No, iconos de conversación, Sofía como hablante, dos estilos, paquete de conversaciones y retorno al planeta. Recorrido real 360° con la nueva ilustración de Platón. Informes: `captures/dialogue-enter-validation.json`, `captures/activity-invitation-validation.json` y `captures/dialogue-stage-validation.json`.







Capturas auténticas: [ruta de escenas](../captures/motor-edicion-cualquier-escena.png), [prueba de diseño global](../captures/motor-dialogos-previsualizacion.png), [objeto y conexión](../captures/motor-objeto-descripcion-y-conexion.png), [cambios ejecutándose](../captures/motor-cambios-aplicados-al-juego.png), [Platón navegable](../captures/platon-dos-mundos-navegable.png).







Las pruebas táctiles son emuladas en Chrome; no se probó un teléfono físico. Sartre conserva su arte provisional y su JSON publicado sin modificaciones; las pruebas editan un perfil independiente. Los prototipos antiguos se conservan y no se presentan como convertidos al nuevo motor de autoría.











`browser_plato_adventure.py` pasó el recorrido completo: guardar lámpara/antorcha y habitación, investigar cuatro elementos, comprender las sombras antes del consentimiento/liberación, una sola identidad de prisionero, escaleras a pie con Sofía/compañero apoyados, primera salida insuficiente, regreso físico a B, decisión final y segundo ascenso. Se comprobaron los dos finales desde un punto de guardado independiente: permanecer en B o acompañar hasta E, nunca seguir a la superficie/universo. El interior no permite saltarse la salida mediante el atlas. Clic y teclado en escritorio; segundo desenlace con toque emulado a 932×430. Sin errores JavaScript. Informe: `captures/plato-adventure-validation.json`.







Capturas: [lámpara local](../captures/caverna-b-lampara-local.png), [investigación](../captures/caverna-c-fuego-investigacion.png), [ascenso acompañado](../captures/caverna-d-ascenso-companero.png), [decisión final](../captures/caverna-decision-final.png) y [desenlace táctil](../captures/caverna-final-exterior-movil.png). El pequeño paso de piedra de D sigue siendo provisional; la validación mecánica no lo convierte en arte definitivo.







`browser_story_map.py` volvió a pasar con los diálogos sin botones auxiliares: mapa inicial, cinco candados, selección previa, piloto y nave única en aterrizaje, reanudación, toque sobre destino abierto/bloqueado, compatibilidad del rescate anterior, separación de Libre/Historia y reinicio. Informe actualizado: `captures/story-map-validation.json`.







## Movimiento, lectura estable y mundos locales — 2026-11-22



TypeScript/Vite compilan y las 57 pruebas de modelo pasan. `json-resource.test.mjs` comprueba errores legibles con la ruta, rechazo de HTML, JSON inválido y respuestas opcionales ausentes. Los borradores se leen antes del archivo publicado; se conserva la migración del descriptor antiguo de Platón.



`browser_local_world_json.py` creó un mundo desde el formulario, recargó la página y abrió Edición, Diálogos y Preguntas para ese mundo sin archivo publicado. Sin errores JavaScript. Informe: `captures/local-world-json-validation.json`.



`browser_dialogue_motion_fix.py` comprobó ausencia de movimiento al cerrar menú/diálogo, liberación de la dirección al perder el foco, entrada a la caverna y paso a B con clic/toque. Con un texto largo de prueba y vista 932×430 comprobó igual altura durante la escritura y entre páginas, ausencia de desbordamiento y de barras, límites de pantalla y cierre sin nueva caminata. Sin errores JavaScript. Informe: `captures/dialogue-motion-fix-validation.json`; [captura auténtica de la página durante la escritura](../captures/dialogo-paginado-estable-movil.png).



Enter/Tab y la confirmación de reinicio volvieron a pasar tras la paginación. Las fixtures usan perfiles aislados; no se borró la partida del autor. El toque es emulado en Chrome, sin teléfono físico.





## Lámpara al entrar en la segunda habitación — 2026-11-22



El pensamiento inicial de entrada ahora otorga `lampara_encendida` al terminar. La puerta a los prisioneros exige esa marca y la segunda sala recupera el encendido en partidas antiguas sin ella. `worlds/plato-compatibility.ts` incorpora estas tres reglas a borradores previos de la aventura, conservando textos y otras recompensas editadas.



Compilación TypeScript/Vite y 59 pruebas de modelo correctas. `browser_lamp_continuity.py` pasó en Chrome: pensamiento inicial sin tocar el objeto de lámpara, cruce a B, máscara transparente alrededor de Sofía y oscura lejos de ella, luz que la sigue al caminar y persiste tras recargar. También se probó un borrador anterior con texto personalizado y una partida guardada en B sin lámpara: recupera el encendido sin reiniciar, en vista móvil 932×430. Sin errores JavaScript. Informe: `captures/lamp-continuity-validation.json`. Capturas auténticas: [segunda habitación](../captures/lampara-segunda-habitacion.png) y [partida recuperada](../captures/lampara-partida-recuperada-movil.png). Toque emulado; sin teléfono físico. Las partidas reales no se alteraron durante la prueba.





## Catálogo con un mundo importado sin definición — 2026-11-22



Se reproduce el error de la captura: una entrada `worlds/import-…json` permanece en localStorage, sin borrador en IndexedDB ni archivo publicado. El arranque ahora aísla esa entrada, continúa con otro mundo disponible y no borra su catálogo ni progreso. El atlas muestra el destino pendiente y el editor ofrece recuperar por JSON con el mismo ID. Las referencias antiguas de mundos canónicos pueden reutilizar su fuente publicada.



TypeScript/Vite compilan y las 59 pruebas de modelo pasan. `browser_missing_world.py` creó un mundo, conservó catálogo/progreso sin su IndexedDB y verificó: arranque jugable, destino pendiente deshabilitado, editor accesible, recuperación mediante el archivo original con el mismo ID y progreso intacto; también una ruta de importación rota de Platón con recuperación automática desde su fuente publicada. Sin errores JavaScript. Informe: `captures/missing-world-validation.json`. [Captura auténtica de recuperación](../captures/mundo-importado-pendiente-recuperacion.png).



No se borraron datos del navegador del autor. La exportación completa exige recuperar las definiciones ausentes para no omitirlas silenciosamente. No se puede reconstruir el contenido de un mundo personalizado a partir de su nombre; su referencia y progreso se conservan mientras falta el archivo.





## Acceso desde la sala del fuego al ascenso — 2026-11-22



Se añadió `fuego-ascenso` sobre el arco pintado derecho, con requisito de prisionero liberado y explicación de qué falta antes de cumplirlo. El controlador de puertas y el historial son los existentes; no hay nueva física ni motor. La compatibilidad incorpora el acceso en los borradores anteriores que carecen de él, sin reemplazar configuraciones de un acceso ya editado.



Compilación TypeScript/Vite y 60 pruebas de modelo correctas. `browser_fire_exit.py` pasó: acceso bloqueado antes de liberar con mensaje preciso; partida en C con compañero y borrador antiguo sin salida; toque real emulado sobre el arco hacia D con compañero presente; regreso a C y su posición real; nuevo cruce y caminata por las escaleras hasta E. Sin errores JavaScript. Informe: `captures/fire-exit-validation.json`; [captura auténtica de C antes de cruzar](../captures/fuego-arco-hacia-ascenso.png). Prueba en Chrome, con clic y toque emulado a 932×430; no teléfono físico. Las partidas reales no se modificaron.



## Menú inicial y partidas independientes — 2026-11-22

TypeScript/Vite compilan; las 65 pruebas de modelo pasan. Las cinco nuevas pruebas de `save-library.test.mjs` verifican migración sin alterar perfiles ni duplicar partidas, campañas y puntos manuales independientes, posición/decisiones, conservación de composiciones, separación de modos, restauración ante fallo de escritura y recuperación desde el automático si faltan las claves de trabajo.

`browser_start_menu.py` pasó en Chrome con perfiles aislados: primera visita sin guardado ficticio, selector de modo, nueva partida con nombre, diálogo de Platón, guardar con nombre, segunda partida sin borrar la primera, carga de un punto que restaura posición y decisiones, Historia nueva con mapa/cinco candados sin alterar Libre, menú del modo recordado tras recargar, Continuar Historia que abre mapa, vuelta a Libre con su partida seleccionada, toque emulado en 932×430 y migración de una partida antigua de Sartre dentro del café. Sin errores JavaScript. Informe: `captures/start-menu-validation.json`.

`browser_core_workbench.py` volvió a pasar con la biblioteca de partidas: pruebas, recursos, diálogos, actividades, exportación/importación y regreso al juego mantienen intacto el perfil durante la autoría. Informe actualizado: `captures/core-workbench-validation.json`.

Capturas auténticas: [inicio](../captures/inicio-continuar-modo-recordado.png), [lista de guardados](../captures/inicio-cargar-partidas-con-nombre.png), [menú móvil](../captures/inicio-menu-movil.png). Prueba táctil emulada, sin teléfono físico. No se modificaron las partidas del autor. Los guardados son locales, sin sincronización en la nube; la fecha de los perfiles antiguos corresponde a su incorporación porque no tenían timestamp previo.

El menú inicial precede ahora al mapa de Historia. Las comprobaciones antiguas que esperaban entrar directamente al mapa o guardar sin nombre describen el flujo anterior; `npm run test:start-menu` valida el flujo vigente.


## Tierra, regreso libre y templo — 2026-11-22

- `npm run build`: TypeScript y Vite correctos. `npm test`: 68 pruebas, 68 aprobadas. Sartre conserva su SHA256 `69F7A16ED882DF14FE5D6DF0A9F3820821E028F950913192CF7DC70E092B37FF`.
- `python tests/browser_earth_and_return.py`: Chrome real en perfil aislado. Partidas nuevas Historia/Libre en Tierra, recorrido radial de 360°, misma nave en cuatro trayectos, salida de Platón antes de presentación/misiones, Kant cerrado, mejoras del templo en un borrador antiguo conservando objetos personalizados, interior con NPC y papiros y retorno al anclaje exterior. Clic real y toque emulado a 932×430; sin errores de navegador.
- `python tests/browser_start_menu.py`: nueva partida, guardados con nombre, carga con posición/decisiones, separación de modos, continuación de Historia por mapa y migración de partida anterior dentro de un interior: correctos. No se alteraron las partidas reales del autor.
- Informe: `captures/earth-return-validation.json`. Capturas auténticas: `captures/tierra-planeta-jugable.png`, `captures/tierra-mapa-antes-del-primer-viaje.png`, `captures/platon-templo-agora-accesible.png`, `captures/tierra-regreso-movil.png`.
- La prueba móvil es emulada, no en teléfono físico. En vista cercana la nave puede quedar fuera del encuadre o detrás del joystick; el botón Vista ofrece la vista general explícita para seleccionarla. La Tierra inicial no añade misiones ni interiores. El templo reutiliza la ilustración griega existente.
- Decisiones, calibración y prompt exacto del recurso IA: [Tierra y regreso](TIERRA-Y-REGRESO.md).

- Regresión adicional `python tests/browser_core_workbench.py`: rutas de edición, carga de imágenes, descripciones, cadenas de acciones, diseño global de diálogos, preguntas y exportación/importación completas: correctas; progreso jugado conservado y cero errores de navegador.


## Presentación inicial de Tierra y preparación de Pages — 2026-11-22

- `npm run build`: TypeScript/Vite correctos. `npm test`: 70/70.
- `npm run test:introduction`: Chrome real con un servidor que solo responde bajo `/los-viajes-de-sofia/`, sin fallback en raíz. Vista inicial completa, acercamiento, caminata detenida durante la presentación, marca persistente por partida, continuación sin repetición, toque real emulado en Vista, movimiento reducido y editor sin tutorial ni progreso: correctos.
- Cero errores de navegador y cero recursos HTTP fallidos; incluye atlas con candados y fondos CSS. Informe local: `captures/planet-introduction-validation.json`. Capturas: `tierra-introduccion-lejana.png`, `tierra-introduccion-cercana-tooltip.png` y `pages-mapa-con-recursos-relativos.png`.
- Se verificó con toque emulado, no en teléfono físico. La Tierra usa `surface.introduction`; el módulo compartido no tiene una rama por ID de mundo.
- La prueba cubre presentación y publicación estática, no vuelve a recorrer los tres actos de la caverna, cuya lógica no cambió.

- Publicación comprobada: GitHub Actions `45074746909` completó pruebas, compilación y despliegue con éxito. La URL `https://luchitoflores.github.io/los-viajes-de-sofia/` respondió HTTP 200; Chrome creó una partida nueva, cargó Tierra y mostró el tutorial sin errores. Informe local: `captures/github-pages-validation.json`; captura real `captures/github-pages-tierra-publicada.png`. El test del hash de Sartre conserva sus bytes originales mediante `.gitattributes`, también en el runner Linux.


## Editor sin herramientas superpuestas — 2026-11-22
- TypeScript y Vite compilan correctamente. `python tests/browser_core_workbench.py`: correcto, cero errores del navegador y progreso jugado conservado. Se comprueba que los controles están fuera del canvas, sin superposición y con toda su superficie accesible, a 1920×900, 1366×768, 932×430 y 600×850.
- Verificados ocultar/mostrar, cambiar escenas y rutas, probar habitación, cargar imágenes, editar acciones y diálogos, preguntas e importar/exportar proyecto. Los controles reutilizan sus nodos originales; no se duplican IDs.
- Capturas auténticas en `captures/editor-sin-panel-superpuesto-*.png`. Las pruebas táctiles son emuladas, no en teléfono físico. La distribución del editor antiguo dentro del juego se conserva; la corrección se aplica a las rutas del motor.


## Conversaciones por escena y apariencia independiente — 2026-11-22

- `npm test`: 73/73, incluido el índice de eventos de regreso/compañero, la numeración por escena y el borrado protegido de borradores. TypeScript y Vite correctos.
- `npm run test:scene-dialogues`: edición del regreso a B conservando recompensa y evento; edición de la versión del prisionero liberado conservando entradas y respuestas; prueba en la habitación real; creación de conversación de llegada condicionada al primer ascenso; creación y eliminación confirmada de un borrador; aspecto global separado con prueba sin guardar y aplicación explícita. Clic real y toque emulado horizontal a 932×430; sin errores del navegador y sin cambiar progreso jugado.
- `python tests/browser_core_workbench.py`: regresión de mundos, lienzo libre en cuatro tamaños, subida de imágenes, acciones encadenadas, apariencia, conversaciones, preguntas y proyecto completo: correcta, cero errores. La selección de escena/world se conserva al navegar entre secciones.
- Los datos de Platón solo ganan nombres legibles de conversaciones: se comprobó igualdad de la narrativa, geometría y recompensas al excluir esos nombres. Sartre conserva su SHA256 original.
- Informes locales: `captures/scene-dialogue-validation.json` y `captures/core-workbench-validation.json`. Capturas: `dialogos-por-escena-prisioneros.png`, `dialogo-version-liberado-editor.png`, `aspecto-dialogos-separado.png`.
- El toque es emulado; no hay prueba en teléfono físico. No se recorrió de nuevo toda la aventura porque sus reglas no cambiaron. Las nuevas condiciones sencillas se guardan como eventos del motor común; no hay un motor narrativo distinto.


## Herramientas integradas, ramas y acontecimientos — 2026-11-22

- `npm test`: 81/81. TypeScript y Vite compilan. Módulos puros comprueban ramas y respuestas exclusivas, resultados/puertas, encuentros del compañero por habitación, repetición, borrado/reconexión, tiradores y migración del descanso antiguo.
- `tests/browser_authoring_next.py` sobre la compilación final: dibujo, movimiento, ocho tiradores, cambio de tipo, toque emulado, rechazo del clic mínimo; añadir textos alternados, reordenar, cancelar/confirmar borrado y reconectar; rama con dos caminos; objetivo y permiso de puerta aplicados en el juego real. Condiciones del compañero por habitación y registro de productores. Cero errores de navegador; progreso del editor aislado.
- `tests/browser_zone_doors.py`: entrada invisible dibujada y conexión efectiva a otro interior; prueba sin escribir progreso; botón del juego abre el mismo editor con mundo/escena conservados.
- `tests/browser_plato_adventure.py` con los fondos del autor: lámpara/antorcha y recarga, investigación, liberación única, ascenso y descenso con pies estables de ambos personajes, regreso obligatorio, prisionero que se queda en B y desenlace alternativo en E. No hay acompañante por el universo. Los objetos de pared se investigan desde el apoyo del suelo, sin exigir saltar hasta su altura visual.
- Regresión `tests/browser_core_workbench.py`: cuatro tamaños del lienzo, imágenes, acciones, apariencia, diálogos, preguntas e importación/exportación completas: correcta.
- Capturas reales: `editor-zonas-tiradores.png`, `editor-conversacion-bifurcacion-eventos.png`, `registro-eventos-y-objetivos.png`, `caverna-b-regreso.png`, `caverna-final-exterior-movil.png`. Informes en `captures/authoring-next-validation.json`, `zone-door-validation.json` y `plato-adventure-validation.json` (según el nombre conservado por el test).
- Integración del proyecto del autor validada antes de escribir, con copia y restauración. Se conservaron los otros mundos sin cambios, los nombres posteriores y el SHA256 original de Sartre. Los datos del editor no contienen las partidas del autor.
- El toque es emulado; no se probó un teléfono físico. La geometría sigue siendo manual y rectangular en interiores, radial en superficies; no hay detección automática de suelo a partir del fondo. Manual: `EDITOR-Y-ACONTECIMIENTOS.md`.


## Estudio de historias — 23 de noviembre de 2026

- `npm test`: 93/93. TypeScript y Vite compilan. Se comprueban identidades/apariciones, contadores, variantes y prioridades, dependencias de la plantilla, decisiones, guion/textos separados, fallback y parámetros, ausencia de colisiones en claves y conservación de condiciones al cambiar la acción principal.
- `tests/browser_story_studio.py` sobre la compilación: crear identidad y segunda aparición, seleccionar/editar, conservar dos acciones con un paso desactivado, añadir y escribir una variante, localizar fuentes de objetivos, preparar simulación, rechazar/aceptar, activar mecanismo y entrar al ágora. El progreso original del perfil aislado se conserva. Exportación/importación del paquete de texto y del proyecto completo, IDs y variantes intactos; móvil horizontal y toque emulado; sin errores de navegador. Informe: `captures/story-studio-validation.json`.
- Regresión `tests/browser_core_workbench.py`: lienzo completo en cuatro tamaños, rutas y pruebas independientes, carga de imágenes y rutas propuestas, descripciones, cadenas de puertas/portales, apariencia global, preguntas, importación/exportación/recarga, tooltip por ratón y pulsación táctil y actividad seguida de viaje. Sin errores de navegador. Registro: `captures/story-studio-core-regression.txt`.
- La prueba de regresión abre explícitamente la sección plegable de imágenes y la de apariencia antes de escribir; no se cambió el comportamiento del editor para satisfacer una expectativa antigua de paneles abiertos.
- Las nuevas variantes del diálogo de presentación pueden volver a anunciarse después del primer encuentro. La presentación general ya leída sigue sin anunciarse otra vez.
- El descriptor publicado de Platón y los otros mundos no se reescriben. Sartre conserva su SHA256 `69F7A16ED882DF14FE5D6DF0A9F3820821E028F950913192CF7DC70E092B37FF`. Los ejemplos de la prueba son borradores de un navegador aislado, no contenido filosófico nuevo publicado.
- Capturas: `estudio-ficha-personajes.png`, `estudio-linea-mision.png`, `estudio-guion-ramificado.png`, `estudio-personajes-movil.png`. No se ha probado un teléfono físico.
- Manual, contrato y límites: [Estudio de historias](ESTUDIO-DE-HISTORIAS.md). No se presenta la preparación de archivos de conversación como traducción completa de interfaz ni como integración del minicore externo.


## 24-11-2026 · Controles contextuales y lámpara

- `npm test`: 102 pruebas; `npm run build`: TypeScript y Vite (juego + playground). Se mantiene el aviso de tamaño del paquete compartido de Phaser; no es un fallo de compilación.
- `browser_mobile_lamp.py`: contexto Hablar + luz secundaria; ocultación en diálogo; joystick con eventos táctiles emulados; cuatro fotogramas de caminar, escala estable y recurso anclado; guardar/equipar, L, recuperación, recarga conservando apagado; edición y exportación/importación de preset; simulación A–E sin escribir progreso jugado. Sin errores de navegador.
- Oscuridad ambiental medida con lámpara apagada (alfa sobre 255): A 128, B 245, C 128, D 114 en el punto observado y E 10. Se conservan el fuego fijo y el gradiente del ascenso.
- `browser_lamp_travel.py`: A → B → C → D → E y vuelta real por el historial, manteniendo apagada la lámpara; compañero presente solo en las habitaciones configuradas; clic y teclado; joystick tangencial en Tierra con apoyo radial estable. Sin errores de navegador.
- `browser_lamp_actions.py`: una acción de equipo configurada en el editor se omite sin su requisito y apaga la luz cuando se cumple; el paso `record` posterior se ejecuta en ambos casos. Se conservan las marcas añadidas por JSON al volver al formulario; la simulación no crea una partida jugada.
- `browser_plato_adventure.py`: regresión completa con investigación, antorcha, guardado, diálogos sin botones auxiliares, cadenas, compañero, escaleras, primer ascenso, regreso obligatorio, ambos desenlaces, segundo ascenso y vuelta al planeta. Sin errores de navegador.
- Sartre conserva el archivo publicado sin cambios. El playground no recibió mecánicas narrativas ni comparte guardados con Platón.

Capturas auténticas: [quieta encendida](capturas/lampara/idle-on-mobile.png), [quieta apagada](capturas/lampara/idle-off-mobile.png), [caminando encendida](capturas/lampara/walk-on-mobile.png), [caminando apagada](capturas/lampara/walk-off-mobile.png).

Chrome de escritorio y viewport 932×430 con toque emulado; **no teléfono físico**. La portación usa las animaciones existentes y una lámpara independiente; faltan poses dedicadas de agarre y llama animada, como explica [CONTROLES-Y-EQUIPAMIENTO.md](CONTROLES-Y-EQUIPAMIENTO.md).


## 24-11-2026 · Gameplay Core, sprites y linterna

- `npm test`: **108/108**. Compilación TypeScript/Vite aprobada; persiste el aviso conocido de tamaño del paquete compartido de Phaser.
- `browser_gameplay_framework.py`: carrera con varios fotogramas y multiplicador, agacharse conservando apoyo, salto/gravedad/aterrizaje sin repetición automática, capacidades activas/desactivadas, linterna, presets exportados/importados y recuperados tras recargar, joystick + Correr simultáneos con dos contactos emulados, nave/proyectiles previos. Sin errores de navegador ni escritura de partidas jugadas.
- `browser_mobile_lamp.py`: linterna en aventura, luz ambiente A–E, conversaciones, ocultación de controles, portación, orientación, guardado y presets. Sin errores de navegador.
- `browser_plato_adventure.py` pasó en producción sin instrumentación: investigación, escaleras, regreso, ambos desenlaces y segundo ascenso, sin errores. Se corrigieron el bloqueo de pendientes por cuadros lentos y el respaldo de selección por coordenadas del canvas, conservando geometría y requisitos narrativos.
- Las hojas nuevas tienen seis celdas cada una: carrera, agacharse y salto. Se registran y reproducen en Phaser; no se presentan PNG estáticos como animaciones terminadas. La galería del laboratorio conserva las hojas fuente con transparencia.
- El estado de la linterna usa los IDs y guardados anteriores. La adaptación del antiguo recurso por defecto y la conservación de imágenes personalizadas tienen prueba unitaria.

Capturas auténticas: [laboratorio](capturas/gameplay/idle.png), [carrera](capturas/gameplay/run.png), [agacharse](capturas/gameplay/crouch.png), [salto](capturas/gameplay/jump.png), [multitáctil horizontal](capturas/gameplay/mobile-controls.png), [linterna en caverna](capturas/gameplay/linterna-caverna.png).

Móvil emulado en Chrome a 932×430; no teléfono físico. El controlador nuevo se utiliza en el laboratorio; el movimiento narrativo de la caverna y la física radial se conservan. Límites de extracción y arte en [GAMEPLAY-CORE-SOFIA.md](GAMEPLAY-CORE-SOFIA.md).


La comprobación adicional de pendientes con reloj de navegador limitado cerca de 20 FPS pasó subida y bajada. Se corrigió el bloqueo por salto de altura por fotograma sin modificar regiones ni permitir bordes sin escalera. La selección lateral también resuelve las zonas reales con coordenadas actuales del canvas, como respaldo a la lista de objetos de Phaser; conserva las exclusiones de menús y diálogos. Pruebas unitarias de pendiente y selección en `gameplay-movement.test.mjs`.

# Decisiones del videojuego



Estas decisiones expresan preferencias explícitas del autor. Aplicarlas en el juego activo `` y conservarlas en futuras modificaciones.



- La interacción principal es tocar con el dedo o hacer clic en el escenario: Sofía camina al destino señalado. Tocar un personaje, objeto o entrada hace que se acerque y lo investigue; no exigir un botón «Acción».

- No mostrar flechas de dirección ni botones de salto. En móvil se admite un joystick analógico discreto como alternativa al toque. Conservar teclado como alternativa accesible.

- La exploración es pausada y de descubrimiento. No activar interacciones simplemente por pasar junto a ellas ni mostrar etiquetas permanentes sobre todos los objetos. Los objetivos van en su botón.

- Los objetos estáticos deben estar ilustrados dentro del escenario, con perspectiva, luz y estilo coherentes. Darles interacción mediante zonas invisibles alineadas con lo dibujado. No superponer recursos que parezcan pegatinas. Los personajes y compañeros animados permanecen independientes.

- El editor debe permitir ajustar las zonas invisibles y mostrarlas solo mientras se edita. Conservar importación, exportación y las partidas existentes.

- Sofía mantiene su altura visible y el apoyo de los pies al cambiar de fotograma y de escena. No debe saltar automáticamente, rebotar, crecer ni encogerse mientras camina. La vista general del planeta es un cambio explícito de cámara.

- Conservar la exploración circular real de la Polis y la gravedad radial. En el ascenso caminar por la pendiente; no hacer saltos ni teletransportes para subir escaleras.

- Mantener el estilo ilustrado de Sofía en filósofos, compañero y escenarios, y la secuencia causal de la caverna inspirada en el Genially del autor.



Validar los cambios de controles con clic real y toque emulado en navegador, además de compilar TypeScript y Vite. Distinguir pruebas emuladas de pruebas en un teléfono físico.



## Arquitectura y universo — actualización del autor



La referencia completa y vigente está en [DECISIONES-DE-DISENO.md](docs/DECISIONES-DE-DISENO.md). Leerla antes de desarrollar mundos, editor o minijuegos. La auditoría y las tensiones con preferencias previas se documentan en [AUDITORIA-MOTOR.md](docs/AUDITORIA-MOTOR.md).



- Un motor común en Phaser 3, TypeScript y Vite; contenido definido en datos. Reutilizar física, cámara, controles, editor, puertas, diálogos y actividades. No crear un motor por filósofo.

- Universo → galaxias históricas → corrientes → un planeta canónico por filósofo → regiones/interiores. Varias rutas pueden conducir al mismo planeta. Latinoamérica tiene navegación temática, no es una época.

- Primera visita: encuentro breve obligatorio con el autor antes de la exploración libre. Reencuentros posteriores disponibles.

- Investigar al autor y planificar toda la geografía y futuras entradas antes de generar arte definitivo. No usar asociaciones arbitrarias ni atribuciones erróneas.

- Arte ilustrado generado con herramientas gráficas. Conservar coherencia; separar NPC, coleccionables y mecanismos que deban moverse, animarse o desaparecer. Mantener zonas invisibles para la interacción con elementos estáticos pintados. No sustituir arte final con emojis o primitivas.

- Prioridad: editor reutilizable, carga de mundos desde JSON, interacciones y NPC, puertas e interiores, diálogos ramificados, parejas, clasificación y decisiones con consecuencias; luego las demás actividades.

- Sartre es el primer caso del motor configurable: cortapapeles y existencia/esencia, Café de las Máscaras y Sala de los Dos Caminos. Planear también mirador, montaña, anfiteatro, bifurcaciones, río/puente, valle comunitario y raíces. Sísifo no es una experiencia de Sartre; tampoco atribuirle el tranvía ni teorías de Caronte.

- IDs permanentes y progreso por planeta. Conservar los prototipos y partidas anteriores. No presentar contenido planificado, recursos provisionales o pruebas de datos como arte final ni como experiencias terminadas.

- Antes de nuevos contenidos, revisar qué parte del sistema ya existe. Si bastan JSON y recursos, no modificar el motor. Evitar reescrituras y abstracciones sin uso probado.



Ruta técnica para los nuevos mundos: `public/worlds/*.json`, validada por `src/worlds/schema.ts` y ejecutada por `src/engine/`. No añadir ramas por autor a `main.ts` para los mundos nuevos. Los casos específicos de la Polis quedan conservados como compatibilidad del prototipo. Consultar `docs/ARQUITECTURA-MOTOR.md` y `docs/SARTRE-DISENO.md`; el caso de Sartre sigue usando arte provisional.



El estado comprobado y las capturas están en `docs/VALIDACION-MOTOR.md`. Para mantener el editor entre escenas, reutilizar `setEditorChoices` y limpiar el inspector al cambiar de escena. Al editar la primera acción de un comportamiento, reutilizar `configurePrimaryBehavior` para conservar su cadena y las recompensas no expuestas en el formulario.



## Correcciones del autor — 21 de noviembre de 2026

- El universo conserva los cuatro mundos ilustrados como destinos visibles y navegables; el atlas de galaxias y corrientes complementa esa vista.

- El filósofo permanece en puntos clave para dialogar y dar retroalimentación; no sigue a Sofía durante la exploración. El prisionero solo acompaña desde su liberación hasta la salida de la caverna; allí concluye el rescate. Nunca acompaña por el universo ni otros mundos. Esto sustituye la antigua decisión de seguimiento global.

- Sofía y los filósofos comparten altura visible: referencia de 118 unidades en la rejilla 960×540, ajustada proporcionalmente en los interiores 1280×720. Los pies permanecen estables; el zoom explícito afecta a ambos por igual.



## Editor y navegación — decisión vigente del autor

- Los filósofos aparecen en encuentros clave de diálogo; no hay seguimiento permanente. Conservar la presentación inicial y los reencuentros en lugares reconocibles.

- Crear nuevos mundos, nombrar objetos, reutilizar recursos y componer interiores desde el mismo editor. El JSON es el formato de datos, intercambio y configuración avanzada; no exigir editar código para crear una habitación.

- Retroceder por una caverna recorre los escenarios anteriores en orden y regresa cerca de su puerta; solo su entrada devuelve a la superficie, conservando el anclaje radial. Aplicar también un historial persistente a las puertas de interiores configurables.



## Motor y generador por plantillas — actualización vigente

- Priorizar jugabilidad y datos. Conservar la Polis/caverna y Sartre; añadir Camus, Hegel, Kant y Heidegger como cuatro planetas de prueba adicionales, sin arte definitivo ni minijuegos nuevos.

- Usar un único fondo principal por escena y recursos provisionales reutilizados. En esta fase personajes, puertas y objetos interactivos pueden ser sprites independientes; no generar arte continuamente.

- Los interiores nuevos usan 1280×720 y suelo principal Y=560. Escaleras y elevadores son explícitos. Las escenas antiguas conservan su rejilla y progreso; cambiar sus fondos no debe cambiar su geometría.

- La referencia visible de Sofía y NPC se conserva al cambiar de rejilla; las superficies mantienen la cámara y el radio radial existentes.

- Separar spriteId (apariencia), characterId (identidad) e instanceId (aparición). Los filósofos permanecen en encuentros clave; no siguen a Sofía.

- Crear por lotes desde public/worlds/blueprints.json con npm run generate:worlds. Validar antes de escribir. Las conexiones pueden pedirse a Codex o al formulario acotado de instrucciones; no afirmar que el juego contiene un LLM general.

- Los diálogos son recreaciones didácticas, no citas. No reducir Hegel a una receta de tres pasos, Kant a maximizar beneficios ni Heidegger a Sartre.

- La petición completa está conservada en docs/ACTUALIZACION-MOTOR-GENERADOR.md y el funcionamiento y fuentes en docs/MUNDOS-GENERICOS.md.



## Nave y viaje entre mundos

- Tocar la nave inicia el embarque de Sofía. Mostrarla en la cabina y elegir destino entre los planetas ilustrados; permitir bajar sin viajar.

- El viaje tiene animación compartida de despegue, vuelo, aterrizaje y desembarque. Conservar altura de Sofía y progreso por planeta; bloquear controles durante la secuencia y respetar movimiento reducido.

- El atlas sigue disponible como consulta independiente. No exigir pilotaje manual ni convertir los portales existentes en viajes de nave.

- Sofía tiene una sola nave: la misma despega, viaja y aterriza. Los objetos de nave de los mundos representan su punto de estacionamiento; no presentar otra nave esperando al llegar. Animar el despegue y el descenso de la propia nave visible en la superficie antes de permitir el desembarque.



## Modos, guardado y encuentros — decisión posterior del autor

- Mantener una única nave, con aspecto configurable mediante recursos del mundo. La representación durante el vuelo debe utilizar el aspecto de la nave con la que Sofía embarcó. Se podrán mejorar esos recursos después, sin crear otro vehículo estacionado.

- Ofrecer modo Historia con ruta preestablecida en datos y desbloqueo secuencial por objetivos, y modo Libre con todos los mundos disponibles. Conservar partidas independientes por modo; las partidas anteriores pertenecen a Libre. La ruta inicial está en `public/worlds/story.json`.

- Guardado automático local y guardado manual desde el menú; continuar debe recuperar el mundo, interiores, posición, descubrimientos y decisiones. Los recursos y borradores del editor se comparten entre modos; sus respuestas y progreso no.

- Al aterrizar, colocar a Sofía cerca del anfitrión sin abrir el diálogo. La primera presentación comienza al tocar/hacer clic en el filósofo o mediante E/Enter estando cerca. Cerrar el mapa, recargar o salir del editor tampoco abre la presentación automáticamente. Esta decisión sustituye el arranque automático de las presentaciones anteriores; se conserva el encuentro como requisito de las actividades del mundo.

- Los NPC deben mirar hacia Sofía al conversar, y Sofía hacia su interlocutor. Aplicar la orientación tanto en interiores como respecto a la tangente de los planetas circulares, manteniendo altura y pies estables.



## Reinicios y mundos bloqueados

- Ofrecer «Empezar de nuevo» desde el inicio y Pausa, con reinicio del mundo actual o del modo actual. Mostrar una confirmación explícita antes de borrar progreso. No reiniciar la partida real del autor como parte de una prueba.

- Conservar el otro modo, los mundos y recursos del editor y las composiciones antiguas de la Polis/caverna. Reiniciar progreso no equivale a borrar diseños. Impedir que el autoguardado de la página saliente restaure los avances recién borrados.

- Al reiniciar una etapa de Historia, las posteriores vuelven a bloquearse hasta completar la etapa reiniciada; sus avances se conservan salvo que se reinicie todo el modo.

- Mantener las ilustraciones de los planetas visibles y ordenadas por la ruta de Historia, con un candado grande sobre cada planeta aún cerrado, nombre y estado legibles. Usar las ilustraciones propias del juego; las referencias de Angry Birds inspiran la presentación del bloqueo, no sustituyen nuestros mundos.



## Entrada de Historia desde el mapa — decisión posterior

- Al empezar, reanudar, reiniciar o volver a elegir Historia, abrir primero el mapa de planetas con sus candados. El jugador elige un planeta disponible antes de explorar.

- La selección de un planeta abierto en Historia inicia el viaje de Sofía en la nave, el descenso de la misma nave a la superficie y el desembarque cerca del anfitrión. Reutilizar la animación común también para esta llegada desde el mapa, sin exigir embarcar previamente dentro de un planeta.

- Mantener oculta e inactiva para el jugador la superficie precargada mientras se elige destino. El mapa inicial ofrece cambiar de modo; la selección del destino inicia la entrada al mundo. Cancelar un reinicio desde ese mapa debe devolver al mapa.

- Conservar los avances y los encuentros elegidos mediante clic. Libre conserva su continuación en la posición guardada; Historia utiliza el mapa y el aterrizaje para entrar de nuevo en un planeta.



## Enter en las conversaciones

- Enter completa el texto progresivo y, una vez visible, avanza una respuesta única o un botón Continuar. Con varias respuestas, se elige mediante Tab y se confirma con Enter; no seleccionar una alternativa automáticamente por abrir el cuadro.

- Una pulsación produce un solo paso. Mantener Enter pulsado no salta varios cuadros ni reabre una conversación al terminar. Conservar clic y toque, los formularios y la confirmación explícita de los reinicios.



## Bocadillos y autoría de conversaciones — decisión del autor

- Indicar conversación con un círculo discreto y un pequeño icono de mensaje bajo el NPC; tocarlo acerca a Sofía y abre el diálogo. No conversar automáticamente al pasar.

- Mostrar bocadillos anclados a quien habla, también Sofía, con dos presentaciones configurables: pergamino con retrato y tinta oscura con nombre. Conservar respuestas ramificadas, Enter, clic y toque; ocultar controles de exploración durante la conversación.

- Reutilizar el editor y JSON del motor para crear mundos e interiores jugables, identidades y apariciones vinculadas a diálogos. La edición visual, importación/exportación y código comparten validación; preservar partidas y las cadenas posteriores de acciones/actividades.

- Platón usa la ilustración del autor Planeta de dos mundos pétreos en superficie y atlas; conservar la física radial, geometría, puertas y secuencia de la caverna. El recorte circular es de renderizado y no modifica la imagen fuente.

- Guía y límites de la compatibilidad del guion antiguo: docs/DIALOGOS-Y-NIVELES.md.



## Caverna en tres actos y diálogos sin botones auxiliares — última decisión

- Un toque/clic en el bocadillo o Enter revela el texto y después avanza. No mostrar botones de Mostrar texto, Continuar, Volver al camino ni menús auxiliares dentro de una conversación. Solo mostrar opciones de decisión/bifurcación o una invitación explícita a actividad.

- La aventura canónica de Platón usa las cinco habitaciones del autor en datos: A entrada, B prisioneros, C fuego, D ascenso y E salida. Mantener el prototipo anterior y sus partidas; no crear un motor exclusivo.

- El primer ascenso no termina la misión. Regresar a B, escuchar el rechazo, decidir si el prisionero se queda o sale y realizar un segundo ascenso hasta E es obligatorio para cerrar y habilitar el viaje fuera del planeta. Esto sustituye el final previo tras el primer rescate.

- El prisionero principal mantiene una identidad y cambia de estado. Acompaña solo cuando corresponde dentro de la caverna, sube y baja con el controlador común y permanece en B o E según el desenlace. Nunca sigue por el universo.

- Iluminación por datos, lámpara local, antorchas persistentes y fuente cálida fija. No detectar suelos desde imágenes ni exigir saltos: geometría manual continua a 1280×720, suelo principal Y=560.

- Conservar clic/toque directo como interacción principal: prevalece sobre la mención de un botón de interacción en el documento adjunto. Los eventos automáticos se reservan para los encuentros narrativos explícitos de los tres actos.

- Implementación y límites: docs/CAVERNA-JUGABLE.md. Solicitud original conservada en docs/AVENTURA-CAVERNA-SOLICITUD.md.





## Rutas de parametrización — decisión del autor

- Separar jugar (`/#/jugar`) de editar (`/#/edicion`), probar diseños de diálogo (`/#/dialogos`) y crear preguntas/actividades (`/#/preguntas`, alias `/#/minijuegos`). Cargar cualquier mundo y escena por ID sin viajar con la partida.

- Las pruebas del motor nunca escriben progreso jugado. Diseños, recursos y contenido son compartidos; los perfiles Historia/Libre conservan sus avances independientes.

- Parametrizar posición, estilo, retratos y tamaño del bocadillo en un ajuste global con prueba antes de aplicar. Las conversaciones solo muestran botones para decisiones o invitaciones a actividades.

- Guardar descripciones de objetos, acciones ordenadas, puertas/conexiones, imágenes incorporadas con nombre/ruta propuesta y notas de diseño. Exportar/importar el proyecto completo validado; conservar cadenas y recompensas al editar la primera acción.

- El navegador no proporciona la ruta absoluta original del archivo. Exportar los bytes y la ruta propuesta; publicar mediante `scripts/apply-project.ts`, primero comprobación y después `--apply`, con copia/restauración. Guía: `docs/MOTOR-Y-RUTAS.md`.



## Correcciones de exploración y lectura — 2026-11-22
- Los clics/toques de menús o bocadillos no deben convertirse en destinos de caminata. Limpiar teclas al abrir diálogos o perder el foco.
- Reservar el espacio de cada página antes de revelar letras. Paginar parlamentos largos con toque/Enter, sin barras ni crecimiento durante la escritura.
- Cargar borradores locales antes de buscar JSON publicados. Un archivo aún no publicado no debe impedir abrir el mundo o el motor. Validar respuestas HTML y mostrar la ruta si falta un JSON obligatorio.


## Continuidad de la lámpara — 2026-11-22
- Completar el pensamiento inicial de Sofía enciende realmente su lámpara antes de entrar a la sala de prisioneros. No dejar la frase como una promesa sin efecto.
- Una partida anterior en la segunda habitación sin esa marca recupera la lámpara; no exigir reiniciar. Conservar los textos y otras recompensas editados en los borradores.
- Mantener oscuridad fuera del foco: iluminar a Sofía y su entorno, seguirla al caminar y conservar el encendido al cambiar de habitación o recargar.


## Referencias importadas ausentes — 2026-11-22
- Un mundo sin borrador ni archivo no debe bloquear el arranque o el editor. Continuar con un mundo disponible, conservar catálogo/progreso y mostrar la entrada pendiente.
- Recuperar por el mismo ID mediante JSON desde el motor. Si se trata de un mundo canónico con una ruta de importación antigua rota, reutilizar su fuente publicada. No crear contenido ficticio ni borrar referencias para esconder el error.
- No exportar un proyecto completo que omita silenciosamente las definiciones pendientes.


## Salida de la sala del fuego — 2026-11-22
- El arco pintado a la derecha de la sala C conecta con el ascenso D después de liberar al prisionero. No exigir volver a buscar un acceso invisible en B si ya se explora C con el compañero.
- Interacción mediante zona invisible alineada al arco existente, descripción al señalar/pulsar y requisito explicado antes de liberar al compañero. El regreso usa el historial real de puertas y conserva posición.
- Incorporar la conexión en borradores anteriores conservando los objetos y ajustes personalizados. Mantener la secuencia obligatoria de regreso a B y segundo ascenso para terminar la aventura.


## Inicio y partidas con nombre — decisión del autor, 2026-11-22
- Abrir el menú del último modo seleccionado con Continuar, Cargar partida, Nueva partida y Cambiar modo. En la primera visita sin guardados se elige modo y luego se crea la partida. No ofrecer Continuar si no existe guardado.
- Cada partida tiene nombre y guardado automático independiente. Guardar con nombre crea un punto manual con fecha, lugar y avance; cargarlo conserva ese punto. Nueva partida no borra las anteriores.
- Los perfiles antiguos se incorporan sin reiniciar. Compartir los recursos/diseños del editor, separar el progreso por partida y modo y bloquear escrituras de la página saliente al cambiar de partida.
- El menú inicial precede al mapa: Continuar, crear o cargar Historia abre primero el mapa con candados y llegada en nave; Libre recupera la posición. Esto sustituye el acceso directo al mapa en el arranque anterior.
- Reiniciar afecta al progreso activo de la partida seleccionada; conserva las otras partidas y los puntos manuales. No pedir confirmación destructiva para crear una partida nueva independiente.


## Tierra, libertad de regreso y ágora — decisión del autor, 2026-11-22
- Las partidas nuevas comienzan en la Tierra, hogar ilustrado generado con IA y planeta radial jugable. Conservar las partidas anteriores en su lugar guardado. La Tierra no es un filósofo ni una etapa histórica; Platón sigue siendo la primera etapa filosófica.
- Se puede embarcar y volver a la Tierra desde la superficie de Platón sin terminar sus misiones. Esto sustituye el bloqueo anterior de salida por misión completa. En Historia los siguientes filósofos siguen bloqueados por sus requisitos.
- Desde la caverna se regresa por las entradas hasta la superficie; el prisionero no viaja por el universo. Mantener una nave compartida en despegue, vuelo y aterrizaje.
- Habilitar el templo exterior de Platón hacia el ágora, con interacción, diálogo y regreso al mismo punto, sin exigir completar la caverna. Reutilizar el arte griego disponible.
- La escala del terreno ilustrado se puede parametrizar sin alterar el radio físico ni el tamaño de Sofía. La Tierra usa el mismo motor y editor, sin un motor separado.
- Guía y prompt del recurso generado: `docs/TIERRA-Y-REGRESO.md`.


## Presentación inicial y mantenimiento — 2026-11-22
- La primera visita jugada a la Tierra muestra el planeta completo y acerca la cámara; un aviso breve indica el botón Vista. Guardar la marca por partida/mundo, respetar movimiento reducido y no ejecutar ni guardar el tutorial desde el editor.
- Cambios de contenido por datos; cambios de presentación en módulos pequeños, con puentes mínimos y pruebas del flujo afectado. No introducir un framework ni reescribir el motor para cambios pequeños. Auditoría y orden de extracciones: `docs/EVOLUCION-MODULAR.md`.
- Publicar el proyecto activo en el repositorio indicado, con GitHub Actions/Pages. El editor web mantiene borradores locales: exportar/aplicar/versionar para compartir contenido publicado.


## Editor sin paneles superpuestos — 2026-11-22
- En las rutas del motor, las herramientas del escenario se integran en el panel lateral, en una sección plegable; no deben tapar el lienzo. Mantener la navegación superior, la selección de mundo/escena y las herramientas funcionales sin duplicar IDs ni perder eventos al cambiar de ruta.
- En móvil estrecho mostrar el escenario completo y el panel de edición debajo, sin superponer controles. Conservar el editor durante el juego como compatibilidad independiente.

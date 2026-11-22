# Historia, Libre y partidas

El inicio muestra el menú del último modo seleccionado: **Continuar**, **Cargar partida**, **Nueva partida** y **Cambiar modo**. La primera vez, sin guardados, se elige Historia o Libre y después se crea una partida con nombre. Continuar solo aparece si hay un guardado en ese modo.

Cada partida conserva un guardado automático. Desde **Pausa → Guardar con nombre** se crea un punto independiente: nombre, fecha, lugar y avance por objetivos. Cargar uno recupera ese punto en su partida y conserva el punto manual para volver a usarlo. Crear otra partida no borra las anteriores. Cambiar modo abre el mismo menú con las partidas de Historia o Libre, sin comenzar a jugar automáticamente.

Las partidas nuevas de ambos modos aparecen en la Tierra. Desde su nave se elige el primer destino. Continuar o cargar Historia desde la Tierra recupera el hogar; desde un mundo filosófico conserva el mapa de planetas con candados y la llegada animada. En Libre se recuperan el mundo, interior y posición. Las partidas antiguas se incorporan como **Partida anterior · Historia/Libre** sin reiniciar su progreso; su fecha inicial en la lista corresponde a la incorporación porque los perfiles anteriores no almacenaban fecha.

Los guardados son locales a este navegador. La biblioteca está en `sofia-save-library-v1`; cada modo conserva sus claves de trabajo anteriores para ejecutar la partida seleccionada. Las transiciones restauran claves y biblioteca juntas y bloquean el autoguardado de la página saliente. Los mundos, imágenes y ajustes del editor se comparten; cargar un punto no reemplaza los diseños. Las composiciones del prototipo se conservan también al crear otra partida.

Historia sigue `public/worlds/story.json`: Platón → Kant → Hegel → Heidegger → Sartre → Camus. La configuración contiene objetivos y marcas de finalización por etapa. Permite revisitar etapas abiertas y bloquea viajes futuros tanto desde el atlas y la nave como desde los portales. El editor sigue siendo una herramienta del autor, no una restricción de la campaña.

Para avanzar: completar el rescate y conversar con Platón a la salida; el deber con Kant; el diálogo del nivel superior con Hegel; la temporalidad con Heidegger; ambas experiencias de Sartre; la conversación con Sísifo en Camus. Los objetivos están dentro de su botón. Esta es una ruta sobre los contenidos existentes y provisionales, no una nueva narración completa ni arte definitivo.

Libre permite visitar todos los mundos publicados. Las partidas anteriores conservan sus claves originales y pertenecen a Libre. Historia utiliza las mismas claves con sufijo `-story`:

| Contenido | Clave de Libre |
|---|---|
| Mundos, diálogos, decisiones e interiores | `sofia-universe-progress-v1` |
| Caverna y escenas del prototipo | `sofia_phaser_real_v02` |
| Superficie original de la Polis | `sofia-polis-radial-v1` |

El modo elegido se recuerda en `sofia-play-mode-v1`. Los borradores, recursos y apariencias de personajes del editor permanecen compartidos en IndexedDB; las respuestas, descubrimientos y posiciones del jugador se separan por modo.

El guardado es automático al avanzar, cambiar de escena, perder el foco y abandonar la página. **Pausa → Guardar con nombre** crea un punto manual independiente. Libre recupera el mundo, interior, posición, conversaciones y decisiones guardados; Historia recupera la Tierra si estaba en el hogar; en los mundos filosóficos abre el mapa y conserva sus avances para la siguiente entrada animada. Las escenas laterales antiguas también conservan su posición. Se guarda en el navegador del dispositivo; no se ha añadido sincronización en la nube.

## Empezar de nuevo

Desde **Pausa → Empezar de nuevo**, elige:

- **Reiniciar este mundo**: borra sus descubrimientos, conversaciones, respuestas y actividades de la partida actual. En Historia, las etapas siguientes se bloquean hasta volver a completar sus requisitos; sus avances se conservan.
- **Reiniciar esta partida**: reinicia su progreso activo y vuelve a la Tierra. Los puntos guardados con nombre y las otras partidas se conservan.

Ambas opciones requieren confirmación. **Cancelar** vuelve al juego sin borrar los avances. Se conservan el otro modo, los borradores e imágenes de IndexedDB, las composiciones de objetos de la Polis y los interiores antiguos creados por el autor. En las visitas archivadas, fuera de los seis planetas canónicos, se ofrece el reinicio de la partida activa.

`src/engine/restart.ts` prepara solo las claves necesarias del perfil seleccionado y restaura los valores anteriores ante un fallo de escritura. Durante el reinicio se suspenden los escritores de progreso de la página saliente para evitar que `blur` o `pagehide` restauren el estado antiguo. El reinicio no utiliza `localStorage.clear()` ni elimina IndexedDB.

## Candados de Historia

Los planetas aparecen en el orden de la ruta, conservan su ilustración y muestran un candado grande y «Bloqueado» si aún no están disponibles. La misma tarjeta se utiliza en el universo y en las rutas del atlas, también al elegir destino de la nave. El nombre accesible explica qué etapa anterior debes completar. Libre no muestra candados.

## Encuentros y orientación

No se abre el diálogo al aterrizar, recargar, cerrar el atlas o salir del editor. La nave aterriza y Sofía baja cerca del anfitrión. Toca al filósofo para acercarte y conversar, o usa **E/Enter** cuando estés cerca. Antes de conocerlo, las actividades indican que debes hablar con él; no abren su presentación por tocar otro objeto. Caminar y consultar los destinos siguen disponibles.

Los interlocutores se miran. `src/facing.ts` calcula el lado relativo; en el planeta utiliza la tangente del NPC y en interiores el eje horizontal. Solo cambia la orientación, sin modificar el tamaño o los pies. Los recursos actuales tienen pose base hacia la derecha.

Durante una conversación, **Enter** completa el texto que está apareciendo y después avanza una respuesta única o **Continuar**. Con varias respuestas, utiliza **Tab** para elegir y **Enter** para confirmar. Enter puede enfocar la primera alternativa sin seleccionarla. Mantener la tecla pulsada no salta cuadros ni reabre la conversación al terminar. También funciona en los diálogos y descubrimientos originales de la caverna; clic y toque se conservan.

## Nave configurable

Los objetos de nave representan el estacionamiento del mismo vehículo. El inspector permite asignar otra imagen mediante el recurso del objeto, manteniendo su identidad y comportamiento. El vuelo toma una copia de la textura de la nave de embarque, en lugar de utilizar siempre una imagen fija. La apariencia del destino puede configurarse con sus recursos; esto no crea otra nave estacionada.

Pruebas del menú actual: `npm test` y `npm run test:start-menu`. Los scripts anteriores de modos documentan el flujo previo al menú con partidas independientes. Los ensayos de navegador requieren Chrome instalado; `SOFIA_URL` indica el servidor local. Informes y límites en [VALIDACION-MOTOR.md](VALIDACION-MOTOR.md).


La Tierra es un hogar disponible en ambos modos, fuera de las etapas filosóficas. Platón sigue siendo la primera etapa. Se puede volver a la Tierra desde la nave aunque falten misiones en Platón; los siguientes filósofos de Historia conservan sus candados. Las partidas existentes siguen en el lugar guardado. [Tierra y regreso](TIERRA-Y-REGRESO.md).

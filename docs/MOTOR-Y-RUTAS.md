# Jugar y editar el motor

Las rutas de autoría están separadas de la partida. Los mundos y recursos guardados se comparten entre modos, pero las pruebas del motor no guardan respuestas ni posiciones en Historia o Libre.

| Ruta local | Para qué sirve |
|---|---|
| `http://127.0.0.1:4173/#/jugar` | Volver al juego y recuperar su partida |
| `http://127.0.0.1:4173/#/edicion` | Seleccionar cualquier mundo y escena, editar objetos, imágenes y conexiones |
| `http://127.0.0.1:4173/#/dialogos` | Crear conversaciones y probar/aplicar su presentación global |
| `http://127.0.0.1:4173/#/preguntas` | Banco de preguntas y actividades con sus lugares de uso |
| `http://127.0.0.1:4173/#/minijuegos` | Acceso alternativo al mismo banco de actividades |

También puedes entrar desde **Pausa → Motor y edición**. Se usan rutas con `#` para conservar compatibilidad con el servidor local y los recursos relativos de la compilación.

## Mundos, escenas y objetos

Selecciona un mundo y una escena en la ruta Edición. No necesitas viajar hasta allí ni desbloquearla en la partida. La URL puede llevar la selección, por ejemplo:

```text
/#/edicion?world=plato&scene=prisioneros
/#/edicion?world=sartre&scene=cafe&object=cafe-notebook
```

El editor conserva su arrastre, zonas invisibles, transformaciones y biblioteca. El botón **Mostrar / ocultar herramientas del lienzo** permite despejar la imagen; el inspector de la ruta sigue disponible. En edición se muestra la ilustración sin la máscara de oscuridad para poder colocar objetos. La prueba recupera la iluminación configurada.

Al seleccionar un objeto puedes editar su nombre y descripción. La descripción funciona como tooltip: aparece al señalarlo con el ratón o mantenerlo pulsado. Una pulsación mantenida permite leer sin ejecutar la acción. No se dibujan etiquetas permanentes sobre todos los objetos.

La secuencia de acciones se edita por pasos. Puedes añadir, quitar y ordenar: examinar, conversar, iniciar una actividad, entrar, regresar, salir a la superficie, viajar a otro mundo, recoger, activar o desbloquear. Cada destino se selecciona de los datos existentes. Para un portal puedes escoger el mundo y su escena de llegada. Se conservan requisitos, mensaje de bloqueo y recompensas.

Ejemplos de cadenas:

- Conversar → iniciar una pregunta → entrar en una habitación.
- Iniciar una actividad → viajar a otro mundo y llegar a su estudio.
- Activar un mecanismo y registrar una marca → mostrar una observación.

Los IDs existentes se conservan. Cambia los nombres visibles; no renombres IDs en un archivo sin revisar referencias y progreso.

## Probar una escena

**Probar escena** ejecuta el escenario seleccionado como simulación. Puedes elegir hasta qué objetivo se ha avanzado y añadir marcas para representar estados concretos. Las marcas se toman de los datos del mundo; no alteran la partida. **Cerrar prueba** vuelve al editor.

Las decisiones del ensayo no se convierten en decisiones del jugador. Los cambios de contenido, en cambio, se guardan en los borradores del motor y se aplican al jugar en ese navegador.

## Cargar imágenes

En Edición hay un campo visible para PNG, JPEG o WebP de hasta 5 MB y entre 16 y 4096 píxeles. Puedes importar:

1. Una ilustración circular para el planeta.
2. Un fondo para la habitación seleccionada.
3. Un recurso para la biblioteca o para un objeto seleccionado.

El fondo nuevo no detecta ni cambia automáticamente el suelo. Usa **Nombre, fondo y apoyo visual** y las herramientas de zonas para alinear la ilustración y la geometría. Las imágenes aplicadas a objetos se presentan como recursos independientes. Los objetos ya dibujados en el fondo conservan la opción de interacción mediante una zona invisible.

Los NPC conservan su identidad: su apariencia compartida se modifica desde el catálogo de personajes, no reemplazando arbitrariamente el recurso de una aparición.

Cada imagen importada conserva su contenido, nombre original y ruta propuesta, como `assets/imported/mi-imagen.png`. El navegador no proporciona la ruta completa de tu disco; por eso se propone una ruta del proyecto. La imagen incorporada permite exportarla aunque todavía no exista ese archivo en `public/assets`.

## Presentación y contenido de los diálogos

La ruta Diálogos separa dos tareas:

- **Diseño global:** estilo, posición, anchura, tamaño de texto, desplazamientos y retratos. Prueba sin guardar y después pulsa **Aplicar diseño a todo el juego**. Una selección global de Pergamino o Tinta prevalece sobre el estilo de cada conversación. La opción de respetar cada conversación conserva sus diferencias.
- **Contenido:** elige mundo, conversación, turno y marcas de la prueba. Puedes abrir el editor de turnos, personajes, respuestas y vínculos. Los lugares donde se usa aparecen como enlaces a la escena correspondiente. **Actualizar biblioteca** recoge los cambios del editor de conversaciones.

Los bocadillos avanzan con toque/clic o Enter. Solo muestran botones para alternativas o para aceptar/rechazar una actividad; no muestran «Mostrar texto», «Continuar» ni «Volver al camino».

## Preguntas y minijuegos

El banco permite crear y editar:

- Preguntas de elección y verdadero/falso, con respuestas válidas y retroalimentación.
- Parejas de elementos.
- Clasificación por categorías.
- Decisiones con consecuencias y razones.

Cada actividad tiene ID permanente, título, consigna, contenido y recompensas. La previsualización utiliza el mismo ejecutor del juego con progreso temporal. **Dónde se utiliza** enlaza a sus objetos y escenas.

La asignación a un objeto sustituye su primera acción y conserva la cadena posterior. Usa el editor de escenas para añadir después Entrar, Viajar u otro paso. Una actividad sin asignaciones puede permanecer en el banco sin aparecer en ninguna escena.

No se añaden minijuegos a la aventura de la caverna por crear este banco: Platón continúa resolviéndose mediante investigación y conversaciones.

## Exportar, importar e incorporar al código

**Exportar proyecto** descarga `sofia-proyecto-motor.json` con:

- Catálogo, mundos, superficies, interiores y zonas.
- Objetos, descripciones, personajes y secuencias de acciones.
- Diálogos, preguntas y actividades con sus referencias.
- Imágenes importadas y metadatos de sus rutas.
- Diseño global de conversaciones y notas de decisión.

El manifiesto de imágenes identifica mundo, recurso, ruta propuesta y si el archivo está incorporado. Los recursos originales del juego se referencian por su ruta; las imágenes nuevas se incluyen en el JSON. La partida del jugador no forma parte del archivo.

Puedes importar el proyecto desde la misma barra. Se valida antes de guardar; los mundos, personajes y recursos se escriben en una transacción de IndexedDB. Si falla, se conserva el contenido anterior. Los borradores no implican una escritura automática en los archivos del repositorio.

Para incorporar el archivo al proyecto sin pedir a Codex que reconstruya cada cambio:

```powershell
npm run apply:project -- "C:\ruta\sofia-proyecto-motor.json"
```

Ese comando solo valida y muestra qué archivos cambiarían. Para aplicarlos:

```powershell
npm run apply:project -- "C:\ruta\sofia-proyecto-motor.json" --apply
npm test
npm run build
```

Se extraen las imágenes incorporadas a sus rutas, se escriben las definiciones y se actualizan `public/engine-settings.json` y `public/engine-project.json`. Se crea una copia en `.project-backups/`. Si falla una escritura se restauran las anteriores; si la restauración encuentra un bloqueo, el comando informa dónde está la copia. No elimina el motor, el código de los prototipos ni otros archivos de imágenes.

También puedes pasar a Codex el JSON y pedir que incorpore su contenido y revise el manifiesto. Las notas de diseño ayudan a entender por qué realizaste los cambios.

## Alcance

El motor interpreta configuraciones; no genera por sí mismo contenidos filosóficos ni implementa un tipo nuevo de actividad a partir de una nota. Un nuevo tipo de mecánica requiere código, pero sus escenas, recursos, conversaciones y referencias quedan preparados para ampliarlo.

La navegación del editor cubre los mundos canónicos definidos en JSON. Los prototipos anteriores siguen conservados como compatibilidad. La ruta ordenada de Historia continúa definida en `public/worlds/story.json`; las nuevas creaciones se registran en Libre.

Las notas y guardados de contenido consecutivos se consolidan para evitar ruido en el historial. No se descartan silenciosamente notas antiguas: al alcanzar el límite de 2000 entradas se solicita exportar. Los cambios de contenido siguen estando en los borradores.


## Recuperar referencias a mundos importados
Si quedó una entrada en el atlas pero falta tanto su borrador como su JSON, el arranque abre otro mundo disponible. La entrada permanece visible como pendiente y no se borra su progreso ni su referencia del catálogo guardado.

En Edición aparece «Mundos pendientes de recuperar». Selecciona allí el JSON original del mundo: debe conservar el mismo ID. El motor valida el archivo, repone el borrador y vuelve a permitir abrirlo con su progreso anterior. Un proyecto completo importado también puede reponer las definiciones. Si un mundo canónico conserva una antigua ruta de importación rota, el cargador utiliza su archivo publicado por ID.

No se fabrica contenido sustituto para mundos personalizados perdidos. Mientras falten definiciones, la exportación del proyecto completo explica qué debe recuperarse antes de exportar; así no produce un proyecto incompleto silenciosamente.

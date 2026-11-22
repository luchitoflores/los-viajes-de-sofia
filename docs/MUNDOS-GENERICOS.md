# Mundos generados con plantillas

Se conservan la Polis/caverna en sus escenas y claves de partida originales y el archivo publicado de Sartre sin modificaciones. `plato.json` es el descriptor del planeta conservado; `index.json` lo vincula al prototipo con `legacy: "polis"`. No sustituye sus escenas por otras vacías.

Los cuatro mundos de prueba se definen en `public/worlds/blueprints.json`. `npm run generate:worlds` valida el lote y produce sus cuatro JSON y el catálogo de seis planetas. No genera imágenes ni motores por autor. Los fondos, cuerpos y retratos son recursos existentes y provisionales; Hegel y Heidegger no tienen aún ilustraciones propias.

Las superficies conservan radio 500 y la cámara radial anterior. Los interiores nuevos usan 1280×720, con suelo principal Y=560. Las escaleras y el ascensor son geometría explícita. Una única textura de fondo reutilizada se alinea con el suelo; se puede sustituir y ajustar su línea de apoyo en el editor. Sofía y los NPC mantienen su proporción visible al cambiar entre rejillas: la referencia es 118/540 de la altura del encuadre, con pies fijos.

## Conexiones

`npm run connect -- "Conecta Camus con Sartre"` crea una conexión de datos validada. También admite `Conecta montaña de Camus con estudio de Kant`. El editor ofrece el mismo formulario. Es un intérprete acotado de instrucciones de conexión, no un modelo de lenguaje dentro del videojuego. Para peticiones más amplias, Codex prepara el lote de datos y ejecuta el generador.

Cada portal valida planeta y aparición. El historial de portales conserva mundo, interior, posición y anclaje; el botón Volver al portal devuelve a esa entrada después de recargar. Las puertas interiores conservan su historial separado. El progreso pertenece al ID permanente del planeta.

## Personajes y conversaciones

`characterId` identifica al personaje; `spriteId` pertenece a su identidad y selecciona la apariencia; `instanceId` coincide con el ID permanente de una aparición. Clara aparece en dos escenas con conversaciones diferentes. Sísifo y Marco comparten una imagen provisional y conservan identidades independientes. Cambiar Sísifo en el catálogo no cambia Marco. Las apariencias compartidas se guardan en el almacén de personajes de IndexedDB, sin borrar mundos anteriores.

Los diálogos admiten respuestas ramificadas, requires/excludes, recompensas y marcas que habilitan puertas. El texto se presenta progresivamente y puede revelarse con un toque o Mostrar texto; el modo de movimiento reducido muestra el texto completo. Las conversaciones completadas se recuerdan por identidad y mundo; la marca `met:characterId` permite condicionar reencuentros. El editor permite modificar texto, personajes y nodos; la lista de respuestas conserva JSON para no construir otro Genially.

## Contenido filosófico y fuentes

Los diálogos son recreaciones didácticas, no citas textuales ni una exposición completa.

- Camus: el absurdo se presenta como confrontación entre la búsqueda humana y el silencio del mundo; Sísifo permite conversar sobre lucidez y rebelión. Se evita presentar a Camus simplemente como Sartre. [Camus, El mito de Sísifo, texto](https://files.blogs.baruch.cuny.edu/wp-content/blogs.dir/2418/files/2013/04/Albert-Camus-The-Myth-of-Sisyphus.pdf), [Stanford Encyclopedia of Philosophy: Camus](https://plato.stanford.edu/entries/camus/).
- Hegel: conflicto y límites internos de una forma de vida permiten conversar sobre mediaciones y transformación; las escaleras son una mecánica de prueba, no la afirmación de un progreso histórico automático. No se usa una receta de tesis–antítesis–síntesis. [Stanford Encyclopedia of Philosophy: Hegel’s Dialectics](https://plato.stanford.edu/entries/hegel-dialectics/), [Hegel, Ciencia de la lógica: contradicción](https://www.marxists.org/reference/archive/hegel/help/iup.htm).
- Kant: distinguir impresiones y condiciones del conocimiento no equivale a inventar el mundo. La promesa falsa permite examinar máximas y universalización sin identificar moralidad con utilidad. [Kant, Fundamentación, texto](https://www.gutenberg.org/files/5682/5682-h/5682-h.htm), [Stanford Encyclopedia of Philosophy: Kant](https://plato.stanford.edu/entries/kant/).
- Heidegger: ser-en-el-mundo, cuidado y temporalidad se vinculan con ocupaciones y posibilidades situadas; no se trasladan sin más las categorías de Sartre. [Stanford Encyclopedia of Philosophy: Heidegger](https://plato.stanford.edu/entries/heidegger/index.html).

No se añaden minijuegos nuevos; los de Sartre y la caverna se conservan.

## Compatibilidad y alcance del editor

La resolución pertenece a cada interior: se pueden añadir habitaciones de 1280×720 a Sartre sin cambiar las coordenadas de sus salas anteriores. Las seis plantillas interiores, la superficie radial y el portal cubren los ocho casos solicitados.

El catálogo guarda las modificaciones explícitas de identidad en IndexedDB versión 3. Las identidades sin modificar conservan sus referencias compartidas originales. La exportación completa incluye los personajes del mundo; al importar, se conservan las modificaciones explícitas que ya tenga el catálogo local. Los almacenes anteriores de mundos y recursos se mantienen.

Si un portal conduce a una habitación de un planeta todavía desconocido, primero aparece el encuentro con su filósofo y después se entra en la habitación indicada. El regreso conserva el punto de origen incluso después de recargar.

La caverna original sigue ejecutándose mediante su compatibilidad existente. Sus diálogos no se han convertido íntegramente al editor configurable. El formulario de diálogos permite editar nodos y texto; las respuestas y condiciones se editan como JSON.

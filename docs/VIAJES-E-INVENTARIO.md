# Trayectos e inventario

Actualización: 24 de noviembre de 2026.

## Orden espacial de los planetas

Mapa y vuelo usan el orden de `planets` del catálogo `public/worlds/index.json`, con la Tierra siempre primero. El orden espacial es independiente de los requisitos de misiones de `story.json`: sobrevolar un mundo no lo visita, no conoce a su autor, no cumple objetivos y no lo desbloquea.

Ejemplo inicial: Tierra → Platón → Sartre. Elegir Sartre desde Tierra muestra el sobrevuelo de Platón; volver a Tierra invierte el recorrido. Se usan las ilustraciones existentes y solo se carga la superficie del destino. Se conserva una sola nave y las fases comunes de despegue, aterrizaje y desembarque.

En **Mundos y escenas → Orden de planetas del viaje**, las flechas mueven destinos antes o después. Al añadir un mundo se incorpora al catálogo; para situarlo entre dos, se mueve allí desde ese panel. Cerrar el editor ofrece guardar o descartar. El orden se incluye en la exportación del proyecto y persiste al recargar. Para compartirlo en Pages, exportar/aplicar/publicar como el resto de diseños. La Tierra permanece fija al inicio.

El tiempo de sobrevuelo se ajusta al número de escalas para que una ruta larga no dure minutos. Se conserva **Omitir animación** y la preferencia de movimiento reducido. No se crean paradas ni aterrizajes obligatorios en cada planeta.

## Inventario de objetos

El acceso **Inventario** está en la barra del juego y en las pestañas de la colección. Reúne objetos recogidos en los mundos de la partida activa: nombre, imagen disponible, mundo, habitación y significado. Historia y Libre conservan sus inventarios independientes.

La fuente es `progress.planet.collected`, que ya guardaba las recogidas; no hay que volver a recoger los objetos de una partida anterior. Los ID de objeto son permanentes. Dos apariciones distintas se conservan separadas; un mismo ID no se duplica. Si un objeto fue eliminado de una definición antigua, se mantiene su ID en el inventario con una explicación de que falta su ficha, sin inventar su significado.

La ficha reutiliza el nombre, la descripción y el texto de la acción **Recoger** del editor de objetos. Cambiar ese contenido actualiza su explicación; no hace falta modificar código. Los recursos integrados en el fondo o las hojas de animación no se muestran como si fueran iconos independientes.

**Objetos recogidos** y **pergaminos de conocimiento** son registros distintos. Por ejemplo, el pergamino de preguntas encontrado durante la exploración entra en el inventario; completar la aventura concede el pergamino de conocimiento de Platón y sus apartados didácticos.

## Verificación

- `npm test`: 122 pruebas, incluidas rutas inversas, inserción de un mundo entre dos y recuperación del inventario antiguo.
- `npm run build`: TypeScript y Vite.
- `tests/browser_flyover_inventory.py`: vuelos, ausencia de visita durante el sobrevuelo, recogida real, significado de objetos, orden editado, recarga y toque emulado horizontal. Utiliza perfiles de prueba aislados, no la partida del autor.

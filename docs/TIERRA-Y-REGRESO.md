# Tierra, regreso y templo de Platón

La Tierra es el hogar inicial de las partidas nuevas en Historia y Libre. Es un planeta circular jugable con el motor radial común, una sola nave y la misma Sofía. Los guardados anteriores continúan en su lugar; no se reinician para imponer el prólogo nuevo.

En los datos se utiliza `role: home` para el mundo y `kind: home` para su entrada en el catálogo. La Tierra queda fuera de las cuatro galaxias históricas; no representa un filósofo ni ocupa una etapa. El campo heredado de anfitrión identifica a Sofía. Platón continúa siendo la primera etapa de `story.json` y Kant sigue requiriendo completar su aventura.

## Viajar y volver

Desde la superficie se puede subir a la nave y volver a la Tierra aunque falten misiones. En Historia, eso no desbloquea los siguientes filósofos. En Libre se conserva la navegación libre. Los descubrimientos y decisiones de cada planeta permanecen guardados.

En los interiores de la caverna se conserva el regreso físico por las entradas. Para viajar hay que volver a la superficie, donde está la nave. El prisionero no sigue a Sofía por el universo ni aparece en la Tierra.

Continuar una partida de Historia situada en la Tierra muestra el hogar; continuar desde un mundo filosófico conserva el mapa previo. Las partidas nuevas, en ambos modos, aparecen primero en la Tierra para embarcar.

## Ágora y templo

Tocar el templo exterior de Platón abre el interior `agora` después del encuentro inicial con Platón, sin exigir completar la caverna. Reutiliza la ilustración griega `polis-library-v2.png`: Platón permanece en un punto de diálogo, la mesa pintada tiene una zona invisible y la salida izquierda devuelve a la superficie junto al templo. Los borradores anteriores reciben la conexión mediante la compatibilidad existente, conservando otras escenas y objetos.

## Recurso de IA

Se utilizó la herramienta integrada **image_gen**, mediante la habilidad imagegen; no se utilizó la alternativa CLI/API. Archivo final incorporado al proyecto: `public/assets/planet-earth-v1.png`. PNG original de 1254×1254, con transparencia real preservada. El archivo generado de origen se conserva en la carpeta de imágenes de Codex.

La imagen no se recortó ni se retocó por programación. Se midió su borde alfa (radio mediano aproximado 565.5 píxeles) y se configuró `surface.terrainScale: 1.0956` para alinear el terreno ilustrado con el radio físico existente de 500. La escala de la ilustración se puede ajustar desde Nombre y fondo en el editor; no cambia la altura de los personajes ni la física.

Prompt final usado:

```text
Create a final production-ready game terrain asset, one tiny spherical PLANET EARTH for a polished hand-painted 2D philosophical storybook adventure. Square 1536x1536 or highest square resolution. A single perfectly circular globe, centered, occupying approximately 88 percent of the square with generous transparent padding all around; genuine transparent background, NO space background, NO text, NO UI, NO characters, NO spaceship or parked ship. Recognizably Earth: luminous deep teal-blue oceans, softly painted green and golden continents, subtle milky cloud wisps hugging the globe, gentle atmospheric blue rim. Painterly illustrated children's adventure aesthetic, warm golden sunlight from upper left, delicate ink contours and watercolor/gouache texture, professional richly detailed restrained style that goes with an illustrated girl astronaut Sofía and a Greek marble miniature planet. The outer edge must form a clear continuous walkable circular silhouette, with a very thin continuous mossy gold/green earthen rim following the entire 360-degree circumference, suggesting miniature terrain at the edge, not a cutaway sphere. A few tiny integrated shrubs and small natural rock formations gently hugging the rim, nothing projecting far beyond the circle. A small integrated cozy earthly village and observatory within the painted northern continent, not detached stickers. Balanced spherical shading, legible at atlas thumbnail size yet richly painted at playable zoom. No separate sprites, no emoji, no geometric placeholder shapes. Export as one isolated circular game terrain with transparent corners; keep the planet round and entire, uncropped.
```

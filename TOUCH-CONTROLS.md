# Exploración por toque

Preferencias persistentes del autor: `../AGENTS.md`.

- Un clic o toque en el suelo fija un destino. Otro toque lo sustituye. Sofía camina en ambos sentidos y se detiene sin oscilar.
- Tocar un objeto, personaje o entrada fija su destino y ejecuta la interacción al acercarse. Pasar cerca sin tocarlo no inicia nada.
- Las flechas en pantalla, Acción y Salto se retiraron. El teclado A/D o izquierda/derecha y E permanece disponible. En móvil hay un joystick analógico; soltarlo o cancelar el gesto detiene el movimiento.
- Los diálogos, el editor y las transiciones cancelan el destino anterior. Un toque dentro de un diálogo no mueve al personaje detrás del panel.
- La gravedad radial y el recorrido de 360° se conservan. En las escaleras se recorre la pendiente también en sentido inverso; no hay salto ni ascenso por teletransporte.

## Ilustración y zonas invisibles

Las dos cámaras de la caverna usan fondos nuevos con los objetos estáticos pintados dentro: lámpara, ánfora, títere, sombra y pasajes. La biblioteca utiliza el papiro ya dibujado sobre la mesa. Sus zonas invisibles coinciden con lo ilustrado; el fondo no tiene desplazamiento parallax respecto a esas zonas. Actores, compañero y cadenas removibles permanecen independientes.

En la Polis se conserva el aspecto externo aprobado: los recursos estáticos existentes se componen en una sola capa de escenario al cargar o editar, y se interactúa mediante zonas invisibles independientes. Al recoger un objeto se recompone la capa. El editor muestra las ilustraciones por separado para mantener la colocación circular y permite ajustar ancho y alto de cada zona de interacción.

En interiores, selecciona una zona en el editor y ajusta «Zona x/y/w/h». «Objeto dibujado en el fondo» evita superponer su sprite. Arrastrar una zona cambia sus coordenadas y el punto al que camina Sofía; no mueve los píxeles pintados en el fondo. Para cambiar esos píxeles hay que editar la ilustración y realinear la zona. Exportación, importación y deshacer incluyen estas propiedades. No se borran las escenas personalizadas existentes.

## Tamaño de Sofía

Los originales contienen halos casi transparentes. Al medir el contorno con alfa mayor que 10, sus alturas varían entre 202 y 228 píxeles. `src/sofia.ts` normaliza los recortes al preparar las texturas: misma altura visible, lienzo y línea de pies. La figura mide 118 unidades de mundo en la superficie y en los interiores. El reposo mantiene una pose estable; la marcha no modifica la escala. Solo la cámara de vista general, solicitada explícitamente, cambia su tamaño aparente.

## Recursos

- `public/assets/polis-cave-entry-v3.png`: entrada con lámpara, ánfora y pasajes integrados.
- `public/assets/polis-cave-shadows-v3.png`: cámara con títere, sombra proyectada y pasajes integrados.
- Se generaron con image_gen editando `polis-cave-v2.png`, conservado intacto. No se modificaron los originales de Sofía.

Prompts: editar el panorama 3:1 manteniendo piedra ocre, iluminación y sendero; incorporar lámpara al 17%, ánfora al 40%, pasaje al 89% y retorno a la izquierda, con perspectiva y sombras de contacto. Para la cámara de sombras: brasero al 45%, títere de caballo al 54% y su sombra suave en la pared, pasaje al 91%, espacios libres para prisionero al 25% y guardián al 62%. Sin personajes, texto, interfaz ni objetos flotantes. Las zonas se calibraron sobre el resultado real.

## Validación

`npm run build`, `npm test` y `npm run test:taps`. La prueba de navegador usa clics y toque emulado en Chrome: vuelta circular por destinos, conversación desde lejos, recogida, entrada, lámpara ilustrada, cambio de destino, zonas editables, altura de fotogramas, joystick y cancelación al soltar. Capturas e informe en `captures/`. El toque emulado no sustituye la comprobación en un teléfono físico.


Resultado comprobado en producción: compilación TypeScript/Vite y 13 pruebas del modelo aprobadas. `captures/tap-validation.json` registra la vuelta por toques, conversación y recogida por clic, objetos pintados, destino en ambos sentidos, ausencia de salto, zonas editables, conservación de colisiones, toque emulado y joystick con parada al soltar. Las seis texturas de Sofía tienen exactamente el mismo contorno vertical, de y=63 a y=303. No hubo errores de navegador en este recorrido.

Capturas reales: `captures/caverna-taps.png`, `captures/biblioteca-taps.png` y `captures/movil-joystick.png`.

Las regresiones completas también pasaron sobre la misma compilación: `tests/browser_story.py` comprobó la liberación, marcha, ascenso, retorno y persistencia del compañero; `tests/browser_planet.py` comprobó 360° en ambos sentidos, conversaciones, recogida, regreso exacto de interiores, edición con ratón y toque, exportación/importación, deshacer y guardado tras recarga. Ambos informes registran cero errores de navegador.

Corrección del autor (2026-11-21): el prisionero acompaña únicamente por la caverna hasta su salida. Los guías de la exploración son los filósofos de cada escenario; Sofía y filósofos comparten 118 unidades de altura de referencia.

Decisión vigente: el filósofo permanece en puntos clave de diálogo, sin seguimiento. El retroceso de la caverna recorre ascenso, sombras y entrada antes de volver a la superficie. El editor permite crear mundos e interiores y colocar recursos mediante toque; conserva teclado y ratón.

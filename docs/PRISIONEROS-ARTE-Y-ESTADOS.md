# Sala B: sombras y prisioneros encadenados

Actualización del 24 de noviembre de 2026. La sala B no contiene un brasero visible. La fuente de fuego pertenece a C; la linterna de Sofía se conserva. No se alteran suelo, pendientes, entradas, IDs de diálogo ni progreso.

## Arte y estados

- Fondo `public/assets/cave-prisoners/shadow-room-v2.png`: edición del fondo importado del autor. Conserva encuadre, arquitectura y apoyo del suelo; elimina el fuego pintado e incorpora proyecciones de caballo, persona y árbol. La oscuridad ambiental sigue configurada en `lighting`, sin luces fijas añadidas a B.
- Hoja transparente `public/assets/cave-prisoners/prisoner-bound-back-idle.png`: seis fotogramas, rejilla 3×2, respiración suave a 3 FPS, personaje sentado de espaldas, con grilletes y cadenas. El bucle se reproduce realmente en Phaser; con movimiento reducido queda quieto.
- `prisionero-encadenado` conserva `characterId=prisionero`, aparece antes de `prisionero_liberado`, usa `spriteId=prisoner-bound-back` y `lockFacing=true`. Los otros encadenados usan la misma apariencia reutilizable.
- Al liberar las cadenas desaparece la aparición encadenada y aparece el compañero libre existente, con la misma identidad y sus animaciones de caminar. Si decide quedarse, su aparición posterior en B sigue libre. No se generó una animación de levantarse o quitarse los grilletes: esa transición sigue siendo el cambio de apariciones del motor.
- Los fotogramas comparten tamaño de celda y anclaje de apoyo. No se anima la escala ni se hace rebotar el personaje.

## Personalización sin sustituir la identidad

En Mundos y escenas, seleccionar el NPC y buscar «Aspecto solo de esta aparición». Permite elegir una apariencia distinta conservando nombre, identidad y diálogos. «Mantener orientación» impide que un personaje de espaldas se gire al acercarse o conversar con Sofía. La configuración se guarda y exporta junto con el mundo.

La hoja animada se describe en `Asset.animation`: columnas, filas, fotogramas, velocidad y anclaje vertical. Se valida al importar. La animación de objetos se ejecuta mediante `src/gameplay/phaser/animated-prop.ts`; la elección de arte por aparición se resuelve en `characterAsset`.

Una ilustración terminada no es un tilemap. El fondo aporta el dibujo; las zonas de suelo, obstáculo y pendiente del editor aportan la geometría jugable. Este cambio conserva la línea de suelo del fondo anterior para no obligar a redibujar zonas.

## Borradores y compatibilidad

`restorePrisonerPresentation` reconoce únicamente los fondos conocidos del prototipo y las apariencias antiguas de los encadenados. Actualiza esos casos conservando fondos personalizados, apariencias explícitas, geometría y conversaciones. Las partidas que ya liberaron al prisionero conservan su estado; no se reinician para mostrarlo encadenado.

Los originales de las imágenes y sprites anteriores no se eliminan. Arte generado con la herramienta integrada `image_gen`, usando el fondo y `companion-idle.png` como referencias.

## Prompts de generación utilizados

### Fondo — edición

Edit target: the provided existing 2D illustrated Greek cave game background. Precise object and lighting edit. Preserve the EXACT composition, camera, framing, side-view floor line at the same height, architecture, left doorway, columns, rocks, floor slabs, chain anchors and ground geometry, painterly game style and colors. This is the prisoners' shadow chamber in Plato's cave, NOT the fire room. REMOVE the visible burning brazier and flame at the right, its pedestal and all orange fiery glow; replace that specific area coherently with existing dark blue-purple cave wall and rock at ground level. No torch, flame, fire, lamp or visible light source anywhere. Keep the architecture readable in subdued cool ambient lighting: darkness will be handled by the game engine, do NOT make the bitmap uniformly black. On the large middle/right rear wall show clear diffuse projected silhouettes of a horse, a person holding a spear, and a tree. These are flat SHADOW PROJECTIONS on stone, not actual people or objects. Their weak muted ochre/grey projection is caused by fire in the other room, entirely off screen; no bright beam, halo or luminous patch. Leave foreground clear for independent animated prisoners. Do NOT paint prisoners or Sofia into this background, no text, no UI. Keep original wide landscape aspect ratio and the floor at exactly its original position. Return only the edited background.

### Prisionero — hoja con transparencia

Use case: identity-preserve illustrated 2D game sprite sheet. Reference image is the exact character identity and painterly/chibi game style to preserve: adult Greek prisoner with curly brown hair, short brown beard, ragged olive-green knee-length tunic, rope belt and sandals, friendly non-violent educational game. Generate a TRANSPARENT sprite sheet with EXACTLY SIX frames in a regular 3 columns x 2 rows grid, identical cell dimensions, no borders, no text/numbers, no background/shadows/floor. Same character seated on the ground with knees bent, viewed strictly FROM BEHIND, facing a cave wall away from the viewer, back of curly head and shoulders visible, NOT looking back, no face visible. Wrists have clearly readable iron cuffs connected by short hanging chains to an iron floor anchor immediately beside his seated hip; ankles together also loosely cuffed. Restrained but comfortable, no injury, fear or pain. Both wrists low beside knees, chains readable at game scale. Keep clothing, hairstyle, body proportions and olive/earth palette exactly matching reference identity. SIX actual distinct sequential animation poses for a gentle idle breathing loop: 1 rest shoulders low, 2 slight inhale shoulders lift, 3 full inhale, 4 slight exhale, 5 rest lower, 6 slight head/shoulder settle. Subtle natural movement only, no turning or standing, chains sway a little with hands. Every frame must keep the buttocks/feet support baseline at exactly 90 percent of its cell height, character the same size and position, full body and all chains fully inside cell with generous transparent gutters. Light softly in cool neutral cave ambient, no flame or glowing light, no extra props except cuffs short chains and small anchor. This sheet will be ANIMATED at runtime, not displayed as a static illustration. Output a wide sprite-sheet canvas with 3 equal columns and 2 equal rows.

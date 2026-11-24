# Controles contextuales y lámpara de Sofía

Implementación incremental del 24-11-2026. Mantiene Phaser, los controladores radial/lateral, las habitaciones, las acciones, los diálogos y el guardado anteriores. El playground sigue separado; no se incorporan disparos a la caverna.

## Auditoría y decisión de compatibilidad

- `navigation.ts`: joystick horizontal analógico existente, compartido con la superficie tangencial y los interiores. Se conserva; ahora su zona muerta es configurable y se cancela al perder visibilidad/foco o quedar bloqueado.
- `main.ts` y `planet-scene.ts`: conservan caminar por toque, teclado, física, escaleras y puertas. Los controles HTML consumen su pulsación; no la convierten en destino del canvas.
- `RoomLight`: se amplía la capa existente; no se crea otra oscuridad paralela. Conserva luces fijas, antorchas y transición al exterior.
- `lampara_encendida`: el guion ya la usa como descubrimiento/requisito de paso. **No se borra al apagar la luz**: hacerlo reactivaría la recuperación y volvería a bloquear puertas. `equipment.lamp` conserva por separado el estado físico, dentro de la misma partida y progreso del mundo.
- Una partida antigua con esa marca y sin equipamiento nuevo continúa con lámpara equipada y encendida. Una partida nueva recibe la lámpara mediante el diálogo/acción existente. La recuperación de B sigue funcionando si falta el descubrimiento; no vuelve a encender una lámpara que el jugador apagó voluntariamente.

## Uso

El joystick semitransparente está abajo a la izquierda en pantallas táctiles. No añade movimiento vertical ni saltos automáticos.

A la derecha, el principal indica Hablar, Examinar, Recoger, Entrar, Activar… según el objeto cercano, visible y disponible. Si solo hay un acceso bloqueado se conserva su explicación habitual. La acción se fija al iniciar la pulsación y se comprueba la cercanía al ejecutarla.

Sin un objeto cercano, el principal alterna la lámpara. Junto a un NPC o puerta, el secundario permite encender/apagar directamente. **Mantener pulsado el principal también alterna la luz**, incluso si el preset oculta el secundario. Un control pequeño Equipo permite guardar/equipar la lámpara. Equipar desde ese control la deja apagada; Encender vuelve a equiparla y encenderla. En ordenador, **L** alterna luz; A/D, flechas, E/Enter y clic siguen disponibles. No se ejecutan atajos mientras se escribe en un formulario.

Los controles se ocultan/bloquean en conversaciones, menús, viajes y edición; vuelven en la prueba jugable. El secundario solo ofrece la lámpara implementada y autorizada por sus condiciones; no muestra armas decorativas.

## Configurar y reutilizar

En `/#/edicion`, abrir **Mecánicas de Sofía · Equipamiento y controles**. Afecta a Sofía en ese mundo, no a los NPC. Ofrece habilitación, marca de adquisición, imagen portátil, radio, intensidad, color del brillo, ajustes de mano/tamaño, requisitos, zona muerta y asignación de los dos botones. La oscuridad es propia de la habitación abierta; se conservan sus luces y gradiente.

Guardar y pulsar Probar escena. Para probar una lámpara ya obtenida, añadir `lampara_encendida` en Estado de la prueba. La partida real no se modifica durante la simulación.

Exportar preset produce `sofia-mechanics-preset` v1; Importar preset lo valida y permite guardarlo en otro mundo. Exportar proyecto conserva `world.mechanics` y las rutas/imágenes incorporadas en su valor. Las rutas estáticas deben existir también en la instalación destino; el recurso portátil incluido está en `public/assets/sofia-lamp-handheld.png`. Este preset no es todavía un SDK general de capacidades, combate o IA.

Las acciones de objetos/eventos pueden usar:

```json
{"type":"equipment","command":"turnOff","requires":["lampara_encendida"]}
```

Comandos disponibles: `equip`, `unequip`, `toggle`, `turnOn`, `turnOff`. Conservan las condiciones por acción y las acciones posteriores. Requieren que la lámpara esté obtenida y habilitada. El catálogo de acontecimientos incluye `equipment:lamp:owned`, `equipment:lamp:equipped`, `equipment:lamp:on` y `equipment:lamp:off`. Se recalculan desde el estado real; no se deben conceder como recompensas manuales. Las condiciones de uso del propio equipo no admiten depender de su encendido/equipado, para impedir bloqueos circulares.

Sin `mechanics`, se adapta el primer `lighting.lampFlag` existente y se mantienen los valores anteriores de radio (250). Mundos sin lámpara no reciben equipo nuevo automáticamente.

## Apariencia y límite artístico

Se mantienen `sofia-idle`, `sofia-walk`, sus recortes y su apoyo de pies. Un recurso independiente sigue puntos de mano por fotograma, orientación y rotación radial. El metal cambia de iluminación/brillo con el estado; no se presentan cuatro PNG como cuatro animaciones nuevas. La textura se reutiliza entre habitaciones mientras su fuente no cambie.

El recurso portátil se generó con la herramienta integrada `image_gen`, usando `cave-lamp.png` como referencia: «misma lámpara griega ilustrada de bronce, portátil, asa izquierda, pico derecho, apagada, sin pedestal, sin llama, fondo realmente transparente, sin texto ni personaje». Se conserva el original y no se reemplaza el arte de Sofía.

Las poses actuales no muestran dedos cerrándose alrededor del asa en todos los pasos. Para un agarre final hacen falta **una pose idle y cuatro poses walk de brazo/mano sujetando asa**, compatibles con `sofia-stable-0/2/3/4/5`, pies y altura actuales; la orientación izquierda utiliza flip. La luz es independiente: no hace falta duplicar esos cinco cuerpos para encendido/apagado. Una llama animada independiente y la transición de agarre siguen pendientes de arte; el portador actual es funcional con los fotogramas existentes.

## Validación reproducible

- `tests/equipment.test.mjs`: migración, apagado persistente, condiciones, comandos, datos inválidos y presets.
- `tests/browser_mobile_lamp.py`: conversación/contexto, toque emulado sobre joystick, cuatro fotogramas caminando, equipo, L, recarga, preset y prueba de A–E sin escribir progreso jugado.
- `tests/browser_lamp_actions.py`: comandos del editor, condiciones por paso y conservación de marcas nuevas en cadenas JSON.
- `tests/browser_lamp_travel.py`: puertas reales A–E y regreso por historial con lámpara apagada, compañero limitado a sus escenas y joystick radial.
- `tests/browser_plato_adventure.py`: regresión completa de la investigación, dos ascensos, decisiones y ambos desenlaces.

Las capturas se generan en `captures/lamp-*.png`. Las pruebas móviles usan Chrome con toque emulado; **no equivalen a una prueba en teléfono físico**. Resultados de ejecución en `VALIDACION-MOTOR.md`.

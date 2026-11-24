# Decisión aprobada y backlog: controles móviles contextuales, lámpara y animaciones de Sofía

> **Estado:** decisiones de diseño aprobadas por el autor, **pendientes de implementación o ampliación** donde se indica. Fecha: 24-11-2026. Documento de especificación para Codex, no certificación de funcionamiento. **No sustituir lo existente.**

## 1. Referencia visual y objetivo

El autor adjuntó dos capturas de un videojuego móvil landscape: joystick en el lado izquierdo y botones a la derecha, uno **contextual** (cambia al aproximarse a objetos/NPC o según la herramienta activa) y otro de **acción principal/ataque**. La referencia es el **comportamiento de controles y la legibilidad**, no la reproducción de gráficos, marca ni interfaz de terceros.

**Decisión:** desarrollar un mismo sistema de entrada y acciones **parametrizable** para la superficie radial y los interiores laterales, reutilizable en otros juegos. El botón contextual puede ser hablar, inspeccionar, recoger, abrir, encender/apagar lámpara, empujar, correr u otra acción, mientras que el secundario mantiene la herramienta principal cuando esa escena realmente la permita.

### 1.1 Qué existe en el repositorio (verificado antes de registrar este pendiente)

- README describe ya **joystick analógico táctil discreto** en superficie, junto a control táctil directo y teclas. Por tanto no asumir que «falta todo el joystick».
- [CAVERNA-JUGABLE.md](CAVERNA-JUGABLE.md) documenta la lámpara de la **entrada A**, ya se enciende en el recorrido narrativo. También existe **una capa de iluminación** y evento con bandera `lampara_encendida`. No crear una iluminación duplicada.
- `public/worlds/plato.json` tiene `lighting.darkness`, `lampFlag: "lampara_encendida"`, luces fijas y transición luminosa para A–E. En A existe una interacción `encender-lampara`; otros nodos conservan esa bandera. **La función nueva solicitada es poder encender Y apagar desde un control persistente y trasladar su estado visual al sprite mientras camina**.
- `src/sofia.ts` ya registra `sofia-idle` y `sofia-walk`, usando recortes de imágenes existentes. Reutilizar este sistema de animaciones y comprobar posiciones/escala, no sustituirlo.
- El playground de mecánicas incluye disparos desde nave y a pie; **mantenerlo separado** del progreso narrativo de Platón.
- El [Estudio de Historias](ESTUDIO-DE-HISTORIAS.md) y el editor ya admiten acciones/eventos. La nueva interacción debe usar esos contratos en lugar de añadir scripts especiales por habitación.

**No afirmar que la lámpara «está ausente»**: existe el encendido narrativo y la oscuridad. Faltan principalmente la **conmutación móvil cómoda, prioridad contextual, portación animada, consistencia del estado, documentación de reglas y pruebas reales**. Codex debe verificar el estado exacto del código antes de decidir qué cambiar.

## 2. UX móvil aprobada

### 2.1 Joystick izquierdo
- Un **joystick analógico**, cómodo para el pulgar, circular y semitransparente; dirección analógica y zona muerta configurables.
- **No mezclar ejes** de distintos tipos de escena. `radial-2d` usa movimiento tangencial y acciones propias; `side-scroller-2d` usa eje horizontal, y el salto/escaleras quedan disponibles **solo cuando lo admite el controlador y la geometría**. Los perfiles top-down 4/8 direcciones o vuelo son futuros; no inventar movimiento vertical en todos los interiores.
- Conservar teclado y pulsación/clic existentes, no romper los controles alternativos.
- Bloquear la interacción del joystick con el canvas para que no active puertas o diálogos al arrastrar.

### 2.2 Botón contextual derecho
- **Un botón principal inteligente** con icono, nombre corto y acción según el objetivo cercano y los estados de Sofía.
- Acciones posibles: **Hablar, Examinar, Recoger, Abrir/Cerrar, Activar, Empujar, Subir/Bajar**, **Encender/Apagar lámpara**, **Correr** como fallback opcional. `Iniciar minijuego` se añadirá cuando exista integración del core.
- **Prioridad sugerida (validar con UX):** interacción enfocada válida (NPC/puerta/objeto alcanzable) > acción contextual de escenario (cadena/palanca) > **lámpara equipada** (encender/apagar) > correr, solo en escenas que lo permitan. **No volver inaccesible la lámpara durante una interacción prolongada:** toque largo del contextual o botón secundario de equipo configurable puede forzar alternar lámpara, sin añadir cinco botones.
- Si hay varios objetivos cercanos, seleccionar el más cercano y **visible**, con prioridad explícita y resaltado sutil. Si el contexto cambia mientras se toca, fijar la acción al inicio de la pulsación para evitar disparar otra cosa.
- Mostrar «Hablar», «Encender», «Apagar», etc. como microetiqueta accesible; no solo icono ambiguo.
- Un control contextual no debe ejecutar **disparo** a menos que el actor tenga esa capacidad y el perfil lo defina.

### 2.3 Segundo botón derecho
- **Acción equipada**: por ejemplo pulsos/disparo para pruebas de acción, usar herramienta activa o ataque en escenas compatibles. No mostrar «espada» siempre en una caverna sin combate.
- La **lámpara** es una herramienta, no necesariamente un arma. Si el botón contextual se ocupa en hablar/abrir, proporcionar una alternativa sencilla para alternar luz.
- Mantener tamaño y margen táctil correctos en móviles landscape, sin cubrir personaje, salidas, mensajes o botón de pausa.
- El estado del botón debe actualizarse cuando se acerca/aleja, equipa herramienta, cambia escena o inicia diálogo.

## 3. Lámpara como mecánica reusable del Gameplay Core

### 3.1 Contrato funcional
- Identidad de herramienta propuesta `lamp` (independiente de la ilustración).
- Estados **`unequipped`**, **`equipped-off`**, **`equipped-on`**. No confundir *pose de portar lámpara* con *estado de iluminación*.
- Comandos `equip`, `unequip`, `toggle`, `turnOn`, `turnOff`; comprobar disponibilidad, permisos y estado de diálogo/escena antes de ejecutarlos.
- Reutilizar la bandera `lampara_encendida` del mundo de Platón mediante adaptador al sistema de estados existente; si se requiere `lampOwned` nueva, añadir con migración segura sin perder las partidas.
- **La luz sigue a Sofía** con el movimiento, una máscara/superposición/iluminación ya existente (mejorar antes de reemplazar). Ajustes: radio, intensidad, color, cono opcional, transición encendido/apagado, luces ambientales fijas.
- La linterna ilumina y puede revelar objetos **si la escena los configura**. No inventar que encender luz otorga automáticamente conocimiento o completa una misión; debe ejecutar eventos narrativos aprobados.
- No dejar a Sofía atrapada sin luz si la apaga accidentalmente: A incluye mecanismo de recuperación/ayuda; permitir encender mientras camina o con controles accesibles.
- Pausar correctamente luz/sonido/animaciones durante diálogos y reanudarlos sin perder estado.

### 3.2 Uso pedagógico por habitaciones de Platón

| Escena | Comportamiento | No romper |
|---|---|---|
| A · Entrada | Descubre/obtiene la lámpara, tutorial mínimo, enciende/apaga y recupera luz | Activación narrada existente, antorcha opcional, puerta B |
| B · Prisioneros | Zona muy oscura; la luz sigue a Sofía y permite explorar cadenas/muro/NPC | Condiciones y diálogos de liberación ya creados |
| C · Fuego y sombras | Contraste entre lámpara local, fuego y proyecciones; examinar objetos con luz sin «borrar» automáticamente sombras | Investigación y flags originales |
| D · Ascenso | Luz en movimiento, escaleras y transición gradual a claridad exterior | Suelo, escaleras, retornos y companion |
| E · Exterior | Luz ambiental de día; lámpara puede conservarse como equipo sin oscurecer el mundo | Deslumbramiento narrativo, segundo ascenso y cierre |

**Rigor:** luz no es sinónimo automático de «verdad», y la alegoría no se reduce a encender una lámpara. Las acciones posibilitan explorar; los diálogos y consecuencias desarrollan el problema filosófico.

## 4. Sprites y animación de Sofía

**Distinguir arte de mecánica:**

- **Gameplay Core**: animador por estados, equipamiento, activación de luz, offsets de herramienta, entrada y prioridad de botones.
- **Assets de Sofía**: ilustraciones y fotogramas que representan su cuerpo sujetando lámpara o herramienta, con escala y silueta consistentes.

**Mínimo viable para la lámpara**: `idle_lamp_off`, `idle_lamp_on`, `walk_lamp_off`, `walk_lamp_on` con fotogramas consistentes y orientación lateral; animación/transición breve `lamp_toggle` opcional. Incorporar poses específicas para subir escaleras/saltar **solo si** los movimientos originales lo necesitan ahora. No bloquear funcionalidad básica si falta arte final: usar la animación de caminar existente con **sprite de lámpara independiente anclado a la mano** y halo de luz; permite cambiar el equipo sin crear decenas de imágenes por estado.

**Opciones artísticas en orden de eficiencia:**
1. **Más recomendable:** mantener sprites existentes de Sofía + **lámpara como sprite separado** con puntos de anclaje por frame y versión apagada/encendida. Evita duplicar todas las animaciones y facilita otros objetos equipables.
2. Para mejores poses: generar solo fotogramas de **agarre de lámpara** coherentes con anatomía, tamaño, rostro, traje y iluminación de Sofía. No mezclar estilos o deformar la figura en cada frame.
3. Las poses de arma, herramienta de disparo y sujeción futura siguen la misma arquitectura de equipamiento, pero **no son requisito para la lámpara de Platón**.

**Criterios gráficos:** transparencia real, no fondo recortado, mismo punto de apoyo de pies, altura consistente, manos/anclajes correctos, lateral mirando derecha/izquierda, anti-jitter, comparación de escala en escena y móvil. El arte solo se considera listo si se ve animado dentro del juego; un PNG aislado no valida el movimiento.

## 5. Editor tipo Genially + preset

En `/#/edicion`: seleccionar Sofía o personaje → pestaña **Mecánicas** → `Equipamiento` → añadir **Lámpara** → personalizar radio/color/intensidad, condiciones, acciones por botón y sprites/animaciones. En la escena: colocar zonas oscuras y luces fijas; **Probar** sin modificar guardado real.

Formato de configuración **ejemplo conceptual — NO compatible sin adaptación al esquema actual**:

```json
{
  "entityId": "sofia",
  "controllerProfile": "side-scroller-2d",
  "tool": {
    "id": "lamp",
    "enabled": true,
    "light": { "radius": 235, "intensity": 0.9 },
    "asset": "lamp-handheld",
    "anchor": "rightHand"
  },
  "controls": {
    "primaryContextual": "auto",
    "secondary": "equippedAction"
  }
}
```

El editor transforma esta selección en el esquema válido del motor actual, o se introduce con validador y migración. Nunca agregar JSON que el intérprete ignore silenciosamente.

## 6. Pruebas y aceptación obligatorias

1. En móvil horizontal, joystick mueve a Sofía tanto por planeta radial como por caverna lateral sin activar objetos por accidente.
2. Cerca del NPC, el botón contextual muestra **Hablar** y abre el diálogo adecuado; al alejarse vuelve al estado apropiado.
3. Cerca de puerta desbloqueada, muestra **Entrar**; bloqueada, muestra mensaje condicionado, nunca entra por error.
4. En zona normal y con lámpara disponible, alternar **Encender/Apagar** sin bloquear futuras interacciones; el icono refleja el **estado real**.
5. El radio de iluminación sigue a Sofía al caminar; fuera de él la sala B permanece oscura, con un mínimo de seguridad visual.
6. El sprite sostiene la lámpara al permanecer quieto **y al caminar**; no se «desprende» de la mano cuando cambia de fotograma; sin saltos de escala.
7. Cambiar entre A, B, C, D, E respeta configuración de luz ambiental, estado de herramienta, zonas, puertas, NPC y progresión narrativa.
8. Abrir/cerrar diálogo, guardar/cargar y alternar entre Historia/Libre no deja luces o controles en estados inconsistentes.
9. Joystick, botones y bocadillos no se solapan en teléfono landscape; botones suficientemente grandes y accesibles, incluida entrada con lámpara apagada.
10. Al publicar: `npm test`, `npm run build` y prueba de navegador real (incluido viewport móvil) aprobadas, sin regresiones en Platón/Sartre ni en el playground.

## 7. Backlog para Codex (separar cambios por entregas)

- **P0 / auditoría:** localizar código exacto de iluminación, `lampara_encendida`, botones táctiles, joystick, estado visual del personaje, mecanismos de diálogo y guardado. Proteger funcionamiento existente.
- **P1 / controles:** joystick reutilizado y botón contextual dinámico con selector de acción/feedback de foco, segundo botón configurable, pruebas de escena.
- **P2 / lámpara:** conmutador completo reutilizando la iluminación de A–E; luz local anclada a Sofía, visual de encendido/apagado y consistencia al caminar/entrar/salir.
- **P3 / arte:** introducir lámpara independiente + anclaje a mano como implementación rápida; solo generar nuevas poses de Sofía si la prueba visual lo necesita, con spritesheet validado y animaciones reales.
- **P4 / editor:** exponer propiedades en panel de mecánicas, guardar presets, importar/exportar y probar escena; integrar condiciones narrativas.
- **P5 / reutilización:** usar el sistema con otra herramienta o mundo y documentar contrato de Gameplay Core. No extraer framework 3D ahora.

## 8. Instrucción de implementación

Consultar el prompt de Codex compartido con el autor. **Primero inspeccionar, después implementar P1–P3 en cambios pequeños y verificables**. El usuario quiere una implementación jugable real, no solo botones decorativos. Si los recursos para el sprite final todavía no están disponibles, usar temporalmente sprite de lámpara independiente sin mentir sobre las animaciones finales.

**Fuentes del propio proyecto:** [Guía de Caverna](CAVERNA-JUGABLE.md), [constructor reutilizable](DECISIONES-EDITOR-VISUAL-MECANICAS-REUTILIZABLES.md), [Estudio de Historias](ESTUDIO-DE-HISTORIAS.md), `public/worlds/plato.json`, `src/sofia.ts`. Capturas de referencia aportadas por el autor en conversación.

**Estado actual:** ESPECIFICACIÓN Y BACKLOG, NO CÓDIGO IMPLEMENTADO.

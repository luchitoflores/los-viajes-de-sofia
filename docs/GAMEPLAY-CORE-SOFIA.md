# Gameplay Core de Sofía · primera base reutilizable

Entrega del 24-11-2026. Implementación sobre Phaser 3 y TypeScript; **no reemplaza Phaser ni constituye todavía un SDK publicado**. Laboratorio: [`playground.html?actor=foot`](../playground.html?actor=foot). Desde Mundos y escenas → Mecánicas de Sofía también se abre el laboratorio.

## Qué funciona

| Capacidad | Implementación | Dónde se utiliza |
|---|---|---|
| Joystick analógico | `gameplay/analog-stick.ts`, captura de puntero, zona muerta, dos ejes opcionales, reset y limpieza | Aventura radial/lateral y playground |
| Caminar, correr, saltar y agacharse | `gameplay/locomotion.ts`, modelo independiente de Phaser, DOM, misiones y guardados | Playground; disponible para otros consumidores |
| Pendientes laterales | `gameplay/side-path.ts`, respeta escaleras continuas sin depender de un salto máximo de altura por fotograma | Caverna y pruebas de movimiento |
| Movimiento radial | `planet-model.ts`, expuesto por `gameplay/index.ts`; física circular existente | Planetas actuales, sin sustituir su controlador |
| Selección de zonas | `gameplay/hit-test.ts`, coordenadas actuales del canvas y prioridad por zona pequeña | Respaldo del toque/clic en interiores |
| Equipamiento y condiciones | `gameplay/equipment.ts`, `gameplay/conditions.ts`; adaptadores antiguos conservados | Aventura y playground |
| Portación de herramienta | `gameplay/phaser/held-tool.ts`, manos por fotograma, orientación y pivote de pies | Linterna de la aventura y acciones del laboratorio |
| Iluminación | `gameplay/phaser/room-light.ts`, foco dirigido y luz cercana de seguridad, luces fijas | Caverna y laboratorio |
| Animaciones de Sofía | `sofia.ts` y `gameplay/sofia-actions.ts` | Idle/walk existentes; run/crouch/salto en laboratorio |
| Proyectiles básicos | `gameplay/projectiles.ts`, cadencia, avance vectorial e impacto rectangular | Pruebas previas de nave y Sofía a pie |

Los archivos antiguos `worlds/equipment.ts`, `engine/held-lamp.ts` y `engine/room-lighting.ts` reexportan la implementación nueva para conservar sus consumidores. El código de misiones, diálogos, puertas, compañeros y partidas permanece en el motor narrativo.

**Límite de extracción:** el controlador lateral histórico de `main.ts` y su integración con escaleras/editor siguen allí. No se ha reemplazado por el controlador nuevo ni se han habilitado saltos obligatorios en la caverna. El controlador radial se reutiliza, sin duplicarlo. La apariencia de proyectiles y su evaluación didáctica siguen en el playground; los helpers físicos no califican respuestas ni conceden puntos por sí solos. El core no es todavía un sistema general de enemigos, combate, IA o 3D.

## Probar y configurar

En el modo **Mecánicas de Sofía**:

- Joystick o A/D/flechas: caminar. Shift o botón Correr: carrera mantenida.
- C o flecha abajo / botón Agacharse: postura baja mantenida; desplazamiento lento configurable.
- Arriba/W/Espacio o botón Saltar: salto con gravedad y aterrizaje. Mantener pulsado no repite saltos automáticamente.
- L o botón Linterna: encender/apagar. El haz sigue la orientación, conserva luz alrededor de Sofía y no elimina la oscuridad del resto del escenario.
- La distribución derecha usa un botón grande y acciones menores en arco; los iconos y gráficos pertenecen al proyecto, no a la referencia de terceros.
- Ampliar juego ocupa la pantalla y facilita probar multitáctil. Salir de pantalla completa permite volver a configurar. Después de editar un campo, tocar el escenario devuelve el uso del teclado al juego.

La ventana lateral activa/desactiva capacidades y ajusta velocidad, multiplicador de carrera, impulso, gravedad y desplazamiento agachado. Un botón oculto por capacidad desactivada no sigue ejecutando esa acción. Las pruebas de nave, falacias, sombras y mala fe se conservan separadas del modo de movimiento.

**Guardar preset en este navegador** utiliza únicamente `sofia-gameplay-movement-v1`; no escribe las partidas de Historia/Libre. Exportar/importar utiliza JSON validado `sofia-movement` v1. El archivo inicial está en `public/presets/sofia-exploracion-lateral.json`. Importar un preset no cambia automáticamente la aventura: se aplica al laboratorio y puede consumirse por código.

No se añadió un campo de movimiento al mundo que el intérprete ignore: para aplicar estas nuevas capacidades a una escena narrativa falta conectar explícitamente el controlador y las reglas de esa escena, con sus colisiones y eventos. No confundir la exportación del preset de laboratorio con Exportar proyecto del editor narrativo.

## Usar el movimiento en otro juego

```ts
import {createActor, stepActor, explorationProfile} from './gameplay/locomotion';

const actor = createActor(390, 460); // y representa los pies
const profile = structuredClone(explorationProfile);
// En update; entrada y geometría suministradas por la aplicación:
stepActor(actor, {axis: .7, run: true, crouch: false, jump: false}, profile, delta / 1000, {
  minX: 0, maxX: 1000, floorAt: () => 460
});
```

El resultado incluye posición, velocidades, orientación, apoyo, altura de colisión y estado de animación. `canMove` permite bloquear un desplazamiento y `canStand` mantener la postura baja bajo un techo. El anfitrión aporta geometría; no se deducen colisiones de los fondos. El laboratorio usa un suelo plano y límites que reservan espacio para los pulgares. No es un editor de plataformas nuevo.

`parseMovement` valida antes de usar datos importados. `blocked` pausa la entrada del actor. Los adaptadores de Phaser dibujan y animan; las condiciones y recompensas narrativas son responsabilidad del consumidor. Para exportar esta carpeta como paquete independiente todavía habría que formalizar API, pruebas de un segundo juego, versionado y distribución.

## Recursos de Sofía

Los originales idle/walk se conservan. Nuevos PNG con transparencia real:

- `public/assets/sofia-actions/run.png`: seis fotogramas de carrera, animación repetida.
- `public/assets/sofia-actions/crouch.png`: seis poses de descenso; las tres bajas se usan para la animación agachada.
- `public/assets/sofia-actions/jump.png`: seis poses, utilizadas en subida, punto alto, bajada y aterrizaje.
- `public/assets/sofia-actions/flashlight.png`: linterna independiente, sin llama ni pedestal, con los colores del traje.

El laboratorio permite ver y descargar las hojas. `sofia-actions.ts` registra los fotogramas en texturas normalizadas de 280×314 y pivote de pies Y=304, con escala constante por hoja. El movimiento real del salto lo produce el controlador; no una imagen desplazada a modo de demostración. La postura agachada baja por flexión ilustrada, no escalando verticalmente a Sofía.

**Límites artísticos:** los recursos son una primera versión jugable generada con IA, no una certificación de animación final. Falta un ciclo dedicado de caminar agachada/gatear, transiciones más suaves entre algunas poses y dedos dibujados agarrando la linterna. Los anclajes siguen las manos, pero no sustituyen esas poses de agarre. No se generaron sprites de nadar, trepar, atacar o volar a pie porque aún no hay una mecánica aprobada que los use.

Los PNG se generaron con la herramienta integrada `image_gen`, usando `sofia_0.png` como referencia estricta de identidad, rostro y traje. Prompts: hoja 3×2 de seis fases de carrera; hoja 3×2 de descenso a agachada; hoja 3×2 de anticipación/despegue/subida/ápice/caída/aterrizaje; linterna portátil astronauta verde oliva/crema/bronce, lente a la derecha, apagada y transparente. No se reemplazaron los originales.

## Linterna en partidas existentes

Se conservan `lampara_encendida`, los IDs `lamp`, comandos y campos de guardado. Cambia la presentación a linterna y su haz; apagarla sigue sin borrar el descubrimiento narrativo. El antiguo recurso portátil predeterminado se adapta al nuevo; una imagen personalizada se conserva. Las escenas A–E mantienen fondos, geometría, diálogos y requisitos originales. La iluminación existente se amplía, no se ejecutan dos sistemas en paralelo.

## Validación

`tests/gameplay-movement.test.mjs`: controlador, capacidades, gravedad, salto sin repetición, apoyo, condiciones de techo/colisión y presets. `tests/equipment.test.mjs`: incluye adaptación del recurso antiguo sin cambiar el apagado guardado ni una imagen personalizada.

`tests/browser_gameplay_framework.py`: animaciones reales, varios fotogramas de carrera, postura y pies, salto y aterrizaje, capacidades, linterna, exportar/importar, guardado local del preset, joystick y carrera con dos dedos emulados, nave y proyectiles existentes. `tests/browser_mobile_lamp.py` y `browser_plato_adventure.py` comprueban la aventura y sus guardados. Las pruebas táctiles son emulación de Chrome, no teléfono físico.

## GDevelop y la decisión de motor

[GDevelop ya ofrece comportamientos prefabricados, eventos visuales y extensiones JavaScript](https://gdevelop.io/features). Habría sido una alternativa válida. Phaser ya es nuestro motor; aquí se construye una capa de autoría y capacidades propia encima de él, lo que implica mantener y probar esa capa. Migrar no trasladaría automáticamente los datos, editores y partidas existentes. Por ahora se reutiliza lo que funciona y se separan responsabilidades; no se atribuye una ventaja universal a desarrollar todo desde cero.


Capturas de la implementación: [controles horizontales](capturas/gameplay/mobile-controls.png), [carrera](capturas/gameplay/run.png), [agacharse](capturas/gameplay/crouch.png) y [salto](capturas/gameplay/jump.png).


Para ejecutar las pruebas localmente: `npm run build`, abrir un servidor con `npm run preview -- --port 4173` y ejecutar `npm run test:gameplay` en otra terminal. Se puede cambiar la dirección mediante `SOFIA_URL`.


Regresión corregida durante la extracción: el antiguo límite de 24 unidades de altura por fotograma detenía una escalera empinada con cuadros lentos. `canWalkPath` acepta una pendiente explícita y continua y sigue rechazando bordes sin escalera o discontinuidades. Se conserva la geometría del autor; `tests/browser_steep_stairs.py` limita el reloj de animación del navegador para verificar subida y bajada con una cadencia cercana a 20 FPS. No es una medición de rendimiento en un teléfono real.


Prompts exactos y destinos de los recursos: [SPRITES-SOFIA-PROMPTS.md](SPRITES-SOFIA-PROMPTS.md). Validación de pendientes a cadencia reducida: `npm run test:stairs`, con `SOFIA_URL` opcional.

# Auditoría del motor común

Fecha: 2026-11-20. Proyecto activo: `sofia_phaser_v1/`. Fuente de decisiones: `DECISIONES-DE-DISENO.md`, documento del autor conservado íntegro.

## Estado anterior a esta actualización

| Componente | Funciona | Límite comprobado en el código |
|---|---|---|
| Física circular | 360°, gravedad radial y colisiones, `src/planet-model.ts` | Radio compartido de 500; no necesita nuevas leyes por autor |
| Controles y cámara | Toque, clic, joystick móvil, escala estable, vista general | Reutilizables; conservarlos |
| Editor radial | Arrastre táctil, orientación, propiedades, zonas, JSON, deshacer | Catálogo fijo `ART/KINDS`, terreno y filósofo fijos; JSON exporta solo colocación |
| Editor lateral | Objetos, regiones, zonas invisibles, prueba inmediata | Tipos y acciones ligados a `ItemType` y `levels` en `main.ts` |
| Puertas y retorno | Biblioteca/caverna y anclaje exacto | Destinos restringidos a `entrance/library`; falta identidad de mundo |
| NPC y objetos | Personajes, recogida, compañero persistente | `interactWith` contiene condiciones por personaje y objeto |
| Diálogos | Retratos y opciones en modal | No hay grafo de diálogo definido en datos; algunas opciones convergen sin consecuencias |
| Relacionar | Las tres sombras de la caverna | Contenido y reglas incrustados en funciones de la Polis |
| Clasificar | Cuestionario doxa/episteme | No es todavía un componente general de clasificación por arrastre |
| Decisiones | Opciones narrativas | Falta registrar elección, consecuencia y argumentación mediante datos |
| Guardado | Dos formatos existentes, progreso y posiciones | Claves exclusivas del prototipo; no hay separación por planeta canónico |
| Atlas | Cuatro entradas ilustradas | Las épocas están presentadas como mundos; no hay universo/galaxia/corriente/autor |
| Carga de mundos | Importación de posiciones | No carga todavía una definición completa de planeta, interiores y actividades |

La Polis es un prototipo conservado con Sócrates y Platón. No se elimina ni se presenta como dos nuevos planetas canónicos. Las otras tres visitas breves tampoco se cuentan como mundos completos.

## Contradicciones y criterio aplicado

1. **Objetos pintados / recursos independientes.** Se conservan los fondos y zonas existentes. Para nuevos contenidos, el escenario integra visualmente todos los elementos; NPC, coleccionables y mecanismos modificables tienen recursos separados, coherentes con el fondo. Una decoración estática examinable puede conservar una zona invisible. No prometer mover mediante el editor los píxeles de un fondo.
2. **Épocas como planetas / planetas por autor.** El atlas nuevo usa épocas como galaxias. Cada autor tiene un único ID de planeta; las corrientes son rutas a ese mismo ID. Los prototipos anteriores permanecen accesibles en su archivo, sin borrar partidas.
3. **No salto / minijuegos de asteroides y acción.** La exploración conserva caminar por toque, sin salto. La acción futura pertenece a una actividad opcional explícita; no cambia la física común ni añade controles permanentes.
4. **Planeta completo / ampliaciones progresivas.** Completa significa circunferencia y geografía planificada. No significa anunciar todas las regiones como actividades terminadas. Estado del contenido y estado del arte se registran por separado.
5. **Sartre como referencia / primer prototipo Polis.** Sartre valida la nueva definición de mundo y los servicios genéricos. La Polis sigue disponible; no se reescribe su historia por ese cambio de prioridad.

## Arquitectura de la transición

- Mantener `planet-model`, navegación, animaciones y editor actuales. La escena radial recibe un contexto de mundo; no crear una escena radial por filósofo.
- Definición JSON versionada con ID canónico, autor, recursos, superficie, interiores, interacciones, diálogos y actividades.
- Validar datos y referencias antes de activarlos; rechazar IDs duplicados, destinos inexistentes y recursos inseguros. No ejecutar JavaScript procedente de JSON.
- Despachar acciones y recompensas mediante un servicio común. Los textos no contienen HTML ejecutable.
- Un registro de actividades atiende diálogos, parejas, clasificación y decisiones. Configuración y contenido cambian; el componente se mantiene.
- Progreso separado por ID de mundo y por ID permanente de objeto/actividad. No reutilizar ni borrar las claves de la Polis.
- Guardar las configuraciones del editor aparte del progreso. Importar/exportar mundos completos además de conservar el formato anterior de colocación.
- El atlas referencia planetas canónicos; Latinoamérica es una ruta temática, no una quinta época.

## Alcance del trabajo actual

Preparar y probar el motor configurable y el caso de Sartre, no construir todos los mundos o minijuegos previstos. El arte definitivo de Sartre requiere completar su plano exterior y preparar sus recursos; cualquier recurso reutilizado durante la validación se identifica como provisional. No se cuentan como implementados los asteroides, rosco, puzles, disparos ni las ampliaciones futuras.

## Estado después de la implementación — 2026-11-21

Implementado y validado como base común:

- Catálogo de cuatro épocas, corrientes y rutas temáticas; dos rutas apuntan al mismo planeta de Sartre. No se anuncia un planeta latinoamericano inexistente.
- Contexto de mundo en la escena radial existente y uso de la misma escena lateral para interiores configurados. No hay una escena de física por filósofo.
- Definición completa JSON con validación de referencias, identidad, recursos, grafos y recompensas. Las importaciones inválidas no alteran el catálogo activo.
- Encuentro obligatorio en primera visita y consulta posterior; grafos de diálogo, parejas, clasificación por arrastre/toque y decisiones con elección y argumento persistidos.
- Acciones comunes de examinar, hablar, recoger, activar, abrir, iniciar actividad, desbloquear, entrar, retornar y descubrir conceptos/recuerdos.
- Importación de ilustración circular y sprites; objetos independientes y zonas para elementos estáticos pintados; asignación de comportamientos y exportación/importación de mundo completo.
- Progreso por ID de mundo y configuración separada en IndexedDB. Se conserva el formato anterior de la Polis. Un borrador local prevalece sobre el JSON publicado; actualizarlo requiere importar la definición revisada, no una fusión automática de grafos.

Prueba de arquitectura: además de Sartre se importó una definición sintética de otro autor en un navegador aislado. Funcionó con las mismas escenas, actividades y guardado, sin añadir código del motor. Esa definición de prueba no se publica como otro mundo del juego.

Informes: `captures/universe-validation.json` y `captures/universe-mobile-validation.json`. Compilación TypeScript/Vite y 21 pruebas de modelo aprobadas. Las capturas corresponden a Phaser ejecutándose en Chrome.

Pendiente deliberadamente: arte y geografía exterior definitivos de Sartre, actividades de sus regiones futuras, editor gráfico de nodos y contenidos de minijuegos (se configuran actualmente en JSON), actividades opcionales restantes y mediciones en móviles físicos. La clasificación táctil y el editor se probaron mediante emulación, no en un teléfono real.

El arranque omite la precarga de interiores al abrir una superficie y carga los recursos de la escena correspondiente. El cambio de mundo espera a la primera escena lista. El compañero conserva sus recursos al recargar dentro de un interior. El historial de Deshacer de escenas laterales se reinicia al cambiar de escena para no trasladar objetos de otra habitación. La edición de una acción conserva la cadena posterior y las recompensas no expuestas en el formulario.


La animación compartida actual cubre a Sofía y al compañero. La autoría visual de animaciones arbitrarias de otros sprites queda pendiente; los recursos independientes ya pueden colocarse y configurarse, pero no se anuncia un editor de animaciones terminado.

El editor conserva la selección de recurso al cambiar de herramienta y limpia el inspector al entrar en otra escena. Se comprobó también volver del editor universal al editor de una visita antigua sin arrastrar referencias de recursos del otro mundo.

## Corrección de encuentros, creador y regresos — 2026-11-21
Se elimina el seguimiento permanente de los filósofos por decisión posterior del autor. Se conserva al prisionero exclusivamente durante el rescate. Se añade creación visual de mundos provisionales, biblioteca compartida de recursos, nombres de recursos y objetos y creación de interiores conectados en el editor existente. Las puertas usan un historial persistente de escenas y posiciones; la caverna antigua regresa por su cadena de escenarios. Se conserva JSON como formato único de contenido configurable; diálogos complejos y minijuegos todavía se redactan en datos. Las imágenes se importan, no se presentan los fondos reutilizados como arte nuevo definitivo.

# Conversaciones de la demo con Yarn

Esta integración se aplica a la demo GDevelop de tres escenas. No migra el juego Phaser completo.

## Editar sin Codex

1. Abre `game.json` con GDevelop (el acceso `Abrir-editor-GDevelop.cmd` usa la instalación local).
2. Abre los eventos de cualquiera de las tres escenas.
3. El primer evento, «Al comenzar la escena», contiene la acción **Cargar diálogo desde un archivo JSON** de Dialogue Tree.
4. Edita esa acción. Junto al recurso `dialogues/plato.yarn.json`, utiliza el lápiz para abrir el editor Yarn integrado. No abras el evento JavaScript para cambiar los textos.
5. Modifica un nodo, añade turnos, conecta alternativas, guarda el diálogo y guarda el proyecto. Ejecuta la vista previa de GDevelop. Para compartir la versión web, vuelve a exportarla desde GDevelop.

No ejecutes `make_gdevelop.py` después de editar objetos o escenas: ese script reconstruye la demo. Editar Yarn y exportar desde GDevelop no necesita ese generador. El exportador técnico `node engine-comparison/tools/export_gdevelop.cjs` también lee el proyecto y el recurso actuales, sin reconstruirlos.

## Mapa de conversaciones

| Nodo | Lugar / uso |
| --- | --- |
| Platon_Encuentro | Platón, superficie; registra que lo conociste |
| Antes_De_Entrar | Cueva cuando falta conocer a Platón |
| Linterna_Recogida | Objeto de la sala A; registra la recogida |
| Puerta_Sin_Luz | Puerta de A cuando falta recoger o encender la linterna |
| Prisionero_Encuentro | NPC de B; cambia según la prueba esté completada |
| Pregunta_Sombras | Pregunta y dos alternativas; etiqueta `decision` |
| Respuesta_Investigar | Retroalimentación y regreso a la pregunta |
| Respuesta_Correcta | Registra el resultado y enlaza con la conclusión |
| Prisionero_Conclusion | Conclusión y conversación de reencuentro |

Los nombres son identificadores: renombrarlos exige actualizar sus enlaces y las referencias que los inician. Puedes cambiar libremente el texto y añadir turnos dentro de un nodo.

## Turnos, decisiones y condiciones

Un turno por línea:

```text
Platón: ¿Qué crees que estás viendo?
Sofía: Quiero comprobarlo antes de responder.
```

Dos enlaces consecutivos crean una elección:

```text
Una pregunta: ¿Qué hace posible la sombra?
[[Una fuente de luz y los objetos|Respuesta_Correcta]]
[[Las sombras existen por sí solas|Respuesta_Investigar]]
```

En el nodo de pregunta conserva la etiqueta `decision`: muestra el enunciado junto a las opciones, sin pedir un clic adicional. Un enlace único como `[[Pregunta_Sombras]]` continúa sin botón auxiliar. El formato es el Yarn JSON que admite GDevelop; no hay que convertirlo al formato compilado de otras versiones de Yarn Spinner.

```text
<<if $complete == true>>
[[Prisionero_Conclusion]]
<<else>>
Prisionero: Todavía no comprendo esas sombras.
[[Pregunta_Sombras]]
<<endif>>
```

Resultados ya conectados en esta demo:

| Variable Yarn | Consecuencia real |
| --- | --- |
| `$met` | Permite entrar en la caverna |
| `$owned` | Permite usar la linterna; la puerta también exige que esté encendida |
| `$complete` | Marca el objetivo y cambia la conversación de regreso |

`<<set $complete = true>>` registra la prueba. Crear una variable nueva no abre automáticamente una puerta nueva: su condición debe conectarse mediante eventos/comportamientos. El estado se conserva entre estas escenas durante la sesión; no se ha añadido guardado permanente a la demo.

## Vincular NPC y texto

El objeto NPC tiene una variable de texto `DialogueNode`: `Platon_Encuentro` en superficie y `Prisionero_Encuentro` en B. La linterna tiene `Linterna_Recogida`. Puedes cambiar esas referencias en las variables del objeto a otro nodo existente.

El controlador actual sigue reconociendo un NPC interactivo por escena. Añadir un segundo NPC completo, nuevas zonas o nuevas consecuencias todavía requiere ampliar el comportamiento reutilizable. **Yarn resuelve la autoría del diálogo; no convierte por sí solo toda la demo en una plantilla sin código.**

Enter o toque avanza un turno. Las decisiones se eligen con clic/toque o Tab y Enter; Enter sin una selección no escoge una respuesta. El texto, enlaces y resultados vienen del recurso Yarn, no de los antiguos arrays de texto del controlador.

## Límites y próximo paso

Movimiento radial, interacción y bocadillos conservan el controlador JavaScript común. Falta empaquetarlos como comportamientos/eventos visuales reutilizables, paginar textos muy largos y definir el puente de actividades HTML. Las decisiones de esta demo son breves; no se promete una presentación apta para cualquier cantidad de opciones largas.

Fuente: [Dialogue Tree y editor Yarn de GDevelop](https://wiki.gdevelop.io/gdevelop5/all-features/dialogue-tree/).

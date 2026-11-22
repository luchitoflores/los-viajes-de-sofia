# Conversaciones y niveles desde el editor

Los mundos guardados son definiciones jugables, no capturas del editor. Un mundo contiene su superficie, interiores, personajes, interacciones, conversaciones y actividades. El motor común los interpreta al abrirlo. El guardado del editor se conserva en IndexedDB; el progreso del jugador sigue separado por modo.

## Crear y jugar

1. Abre **Editor → Crear nuevo mundo**. Asigna nombre e identidad del autor y una presentación. Aparece en el atlas de Libre al guardarlo.
2. Usa **Crear interior conectado** para añadir una habitación, caverna, sendero, escalera o ascensor. El editor crea la entrada y el regreso; puedes editar nombre, fondo, objetos y zonas.
3. Abre **Catálogo de personajes** para crear o reutilizar identidades. Arrastra su aparición desde la biblioteca a la escena. El recurso visual y la identidad son independientes.
4. Abre **Editar diálogos → Crear conversación**. Elige **Pergamino** (retrato y bocadillo claro) o **Tinta** (bocadillo oscuro con nombre). Selecciona quién habla, incluido Sofía, y escribe su turno.
5. **Añadir turno** crea otro nodo. En cada respuesta, elige un siguiente turno o **Terminar conversación**. Se admiten hasta ocho respuestas. El primer turno se elige expresamente. El validador exige una salida alcanzable en cada rama.
6. En **Vincular esta conversación a una aparición**, elige la escena y el objeto/personaje. Guarda y cierra el editor para probar con clic/toque en el personaje o su círculo de conversación. Dos apariciones de la misma identidad pueden tener conversaciones distintas.

Las condiciones y recompensas avanzadas se conservan al editar los campos visuales. Puedes cambiarlas desplegando **Condiciones, recompensas y respuestas en JSON** y pulsando **Aplicar JSON a las respuestas**. Guardar valida todo el mundo antes de reemplazar el borrador.

El círculo con mensaje es una señal de conversación disponible. No inicia diálogos al pasar. Durante la conversación se ocultan los controles de exploración. Tocar el bocadillo o pulsar Enter revela el texto y avanza una respuesta única sin mostrar botones auxiliares; con alternativas se muestran las opciones, Tab selecciona y Enter confirma.

## Archivos externos y código

**Exportar mundo completo** e **Importar mundo JSON** intercambian un nivel entero con sus interiores. **Exportar conversaciones JSON** permite trabajar solo en sus grafos y vínculos. La importación de conversaciones exige el mismo `worldId`, rechaza referencias rotas y conserva escenas, recursos y progreso. Exporta las imágenes importadas con el mundo completo; el paquete de conversaciones solo contiene texto, referencias y vínculos.

Ejemplo de paquete para Sartre (recreación de ejemplo, no una cita):

```json
{
  "format": "sofia-dialogues",
  "version": 1,
  "worldId": "sartre",
  "dialogues": {
    "mi-encuentro": {
      "style": "parchment",
      "start": "saludo",
      "nodes": {
        "saludo": {
          "characterId": "sartre",
          "speaker": "Jean-Paul Sartre",
          "text": "¿Qué quieres observar?",
          "choices": [{"id": "explorar", "text": "Seguir explorando"}]
        }
      }
    }
  },
  "bindings": []
}
```

Un vínculo tiene la forma `{"scene":"surface","object":"ID-DE-LA-APARICION","dialogue":"mi-encuentro"}`. Para interiores, `scene` es su ID permanente. Copia los IDs del mundo exportado; no inventes referencias. `bindings: []` añade conversaciones sin reasignar ninguna aparición.

Desde TypeScript se usa la misma validación que en el editor:

```ts
import {mergeDialoguePack, dialoguePack} from './worlds/dialogues';
const nuevoMundo = mergeDialoguePack(mundoActual, paquete);
// Serializar nuevoMundo como sofia-world o persistirlo con el mecanismo del editor.
const conversaciones = dialoguePack(nuevoMundo);
```

Para encadenar una actividad existente, una interacción puede contener `actions: [{"type":"talk","target":"mi-encuentro"},{"type":"activity","target":"ID-ACTIVIDAD"}]`. Solo se ejecuta la segunda al completar la conversación. La asignación de diálogo conserva las acciones posteriores y los requisitos. Los tipos de actividades siguen siendo parejas, clasificación y decisiones; añadir un tipo nuevo sí requiere implementarlo en el motor.

## Alcance y compatibilidad

El editor construye niveles a partir de lo que tú guardas. No inventa por sí solo historias ni contenido filosófico. Los mundos creados están disponibles en Libre; la ruta ordenada de Historia se configura en `public/worlds/story.json`.

La Polis de Platón conserva la exploración radial y los guardados anteriores, e incorpora la [caverna en cinco habitaciones y tres actos](CAVERNA-JUGABLE.md). Todo el nuevo guion se edita en datos desde el editor de conversaciones. El prototipo clásico de la caverna permanece conservado en `main.ts` como compatibilidad, con sus partidas.


Los recursos y borradores se guardan en este navegador. Exporta el mundo completo para tener una copia y llevarlo a otro dispositivo o publicarlo con sus imágenes. No hay sincronización automática con archivos del disco ni con otros dispositivos.


Los bocadillos reservan el alto del texto completo de la página antes de mostrar sus letras. Los textos largos pasan a páginas con clic/toque o Enter; las decisiones se presentan en la última página. No utilizan barras de desplazamiento.

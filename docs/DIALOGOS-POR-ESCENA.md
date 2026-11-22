# Conversaciones organizadas por escena

## Dos pantallas diferentes

- **Aspecto de diálogos** (`/#/apariencia`): tema, letra, retratos, posición y tamaño del bocadillo. La prueba utiliza un texto de muestra. Aplicar guarda el aspecto global. Se mantienen los dos temas existentes, pergamino y tinta, además de respetar el tema de cada conversación.
- **Diálogos por escena** (`/#/dialogos?world=plato&scene=prisioneros`): textos, turnos, respuestas y conversaciones de esa habitación. En Mundos y escenas hay un enlace directo a las conversaciones de la escena abierta.

## Ejemplo: editar lo que se dice al regresar a la caverna

1. Abre el mundo de Platón y la escena **2. B · Sala de los prisioneros**.
2. Pulsa **Ver y editar los diálogos de esta escena**.
3. Busca **El rechazo al volver a la caverna** (en borradores antiguos puede figurar como Regreso conflicto). Su ficha explica que ocurre al recorrer la escena después del primer ascenso y señala dónde se obtiene ese requisito.
4. Pulsa **Editar conversación completa**, cambia el texto y guarda.
5. La ficha del **Prisionero** también tiene versiones: preso, liberado, se queda, etc. **Editar esta versión** abre directamente el turno correspondiente. **Probar esta versión** utiliza esa habitación y simula sus requisitos, sin escribir progreso jugado.

Las versiones no son conversaciones duplicadas. Son entradas distintas del mismo grafo, escogidas según lo que haya ocurrido. Si coinciden varias, el motor usa la primera; si ninguna coincide, usa el inicio habitual. Editar un texto conserva esas condiciones, los caminos posteriores y las recompensas.

## Encontrar conversaciones rápidamente

La superficie es la escena 0; los interiores se numeran según el orden del archivo del mundo. Las fichas usan números como 2.1, 2.2. Son referencias para localizar, no nuevas condiciones de avance ni sustitutos de los IDs permanentes. **Todas las escenas** ofrece el índice completo. **Borradores sin asignar** reúne textos que aún no están vinculados a una escena.

Cada ficha muestra si se inicia al tocar un objeto/personaje, al recorrer una zona o al hablar con el compañero. Los requisitos y las versiones aparecen en lenguaje legible. Los nombres de requisitos personalizados se muestran a partir de sus nombres guardados; no se inventa una relación narrativa cuando no existe en los datos.

## Crear

**Nueva conversación** abre un borrador con nombre, quién habla, texto y respuestas. Puedes vincularlo a un objeto/personaje de esa escena al guardar. Sin vínculo aparece en Borradores sin asignar. Solo se permite eliminar directamente borradores que no tengan referencias; las conversaciones conectadas se editan conservando sus vínculos.

En un interior, **Nueva conversación al llegar / regresar** pide un nombre y un objetivo previo opcional. Después abre el texto. Al guardar crea diálogo, comportamiento y evento en ese interior; la zona abarca la habitación y el motor común lo ejecuta una vez por partida cuando se cumple el requisito. Para delimitar otra zona o condiciones más complejas se conserva la configuración avanzada en datos. La versión sencilla no deduce automáticamente qué puertas hay que atravesar: su condición es el objetivo elegido.

Al añadir un turno a una continuación única que terminaba, se conecta con el turno nuevo. Si hay bifurcaciones, cada respuesta conserva su destino explícito. Los turnos y destinos se muestran con número, interlocutor y comienzo del texto.

## Guardar y compartir

Los borradores se conservan en el navegador y se incluyen en **Exportar proyecto**, junto con los eventos, condiciones, escenas y recursos. Para publicarlos, aplicar el proyecto validado y subir los archivos al repositorio como se explica en `MOTOR-Y-RUTAS.md`. El guardado del editor no publica automáticamente en GitHub.

## Organización técnica

- `worlds/scene-dialogues.ts`: índice de usos reales, incluidos eventos y compañero, etiquetas de condiciones y borrado protegido de borradores.
- `engine/scene-dialogue-editor.ts`: navegación por escena y creación/edición contextual.
- `engine/dialogue-appearance-editor.ts`: apariencia global y muestra visual independiente.
- `engine/dialogue-editor.ts`: formulario reutilizado de turnos y respuestas; mantiene la compatibilidad avanzada.
- Campo opcional `Dialogue.title`, validado y exportado. No se renumeran IDs ni se cambia el motor narrativo al reorganizar el editor.

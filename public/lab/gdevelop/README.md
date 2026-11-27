# Sofía: mundos editables en GDevelop

Abre **game.json** desde «Abrir proyecto» de GDevelop. También puedes ejecutar `Abrir-GDevelop.cmd`.
Este es el mismo proyecto de la plantilla autónoma, ampliado con contenido de Phaser. No se ha creado otra carpeta de demo ni se ha reemplazado Phaser.

## Dónde empezar

- `earth`: superficie circular de Tierra y nave. Toca la nave para elegir destino.
- `plato`: superficie circular, Platón, caverna y ágora.
- `plato__entrada`, `plato__prisioneros`, `plato__fuego`, `plato__ascenso`, `plato__salida`, `plato__agora`: habitaciones importadas de los JSON publicados.
- `sartre` y sus interiores: contenido y arte provisional que ya estaban en Phaser.
- Camus, Hegel, Kant y Heidegger conservan su condición de pruebas con arte provisional.
- `arena`: prueba aislada del combate. Selecciónala y usa la vista previa de esa escena.
- `inicio`, `galeria`, `salida` y `Plantilla`: anteriores ejercicios de autoría, conservados.

## Editar sin Codex

**Duplicar un planeta:** duplica una escena de superficie. Ponle otro nombre. En las variables de escena conserva `Modo=superficie`, modifica `Titulo`, `Orden` y `Superficie` (nombre de la nueva escena). Cambia la imagen del objeto `Planeta`. La selección de destinos descubre las superficies por esa variable; no hay una lista de nombres en JavaScript. `Orden` determina el sentido del viaje y los mundos intermedios. Al añadir un mundo, duplica/configura también su objeto `Sobrevuelo_…` en las superficies desde las que deba verse durante el vuelo: `Tipo=sobrevuelo`, `Mundo=nombre de escena`, imagen del nuevo planeta.

**Poner un NPC en la superficie:** duplica un NPC de esa escena, cambia la imagen y sitúa sus pies sobre el borde del planeta. Su posición determina el ángulo; no necesitas calcular grados. Cambia `Nombre`, `Id` y `Dialogo`. Elimina `Acciones` si quieres usar únicamente el nodo Yarn elegido en `Dialogo`: las cadenas importadas de Phaser tienen prioridad sobre ese campo.

**Añadir una habitación:** duplica una habitación existente, cambia el nombre y su variable `Superficie`. En el objeto `Background`, edita la animación y selecciona tu imagen local. GDevelop incorpora el recurso: conserva la carpeta de imágenes junto al proyecto o usa sus herramientas de proyecto en la nube.

**Suelo, escaleras, obstáculos:** duplica `Suelo`, una `Zona_…` del ascenso o `Obstaculo`. En sus variables el campo `Tipo` vale `suelo`, `escalera` u `obstaculo`. Mueve y redimensiona el rectángulo en el editor. Una escalera es una pendiente que sube de abajo a la izquierda hacia arriba a la derecha. El rectángulo de suelo usa su borde superior. Estas zonas se ven al editar y desaparecen al jugar. Una imagen pintada no crea colisiones automáticamente.

**Conectar caminando:** duplica una zona con `Tipo=paso`; configura `Destino` (nombre exacto de escena), `LlegadaX`, `Direccion` (-1 izquierda, 1 derecha), `Requiere` y `Bloqueo`. Sitúa el rectángulo en el borde de la habitación. No hace falta pulsar una puerta.

**Entradas y portales importados:** cambia `Destino`, `LlegadaX` y `DestinoSuperficie` en sus variables. Las entradas guardan el punto desde el que llegaste. `Acciones` conserva además la cadena avanzada importada, por ejemplo `[{"type":"enter","target":"plato__entrada"}]`; `return` vuelve al acceso registrado y `surface` vuelve al planeta indicado por `Superficie`. Un `Destino` explícito tiene prioridad sobre esa cadena. Para una conexión caminando utiliza los campos sencillos del párrafo anterior.

**Diálogos:** en los eventos de la escena, abre la acción de cargar JSON y el lápiz del recurso `dialogues/mundos.yarn.json`. Cada turno importado tiene un identificador `W_mundo_conversacion_turno`; las ramas auxiliares conservan recompensas y enlaces. Se puede añadir texto y nodos desde Yarn. Los ejercicios antiguos usan `historias.yarn.json`. Los resultados se comparten con la estructura global nativa `Historia`.

**Requisitos:** `Requiere` es una lista separada por comas; todos deben cumplirse. `!marca` exige que no esté cumplida. `OcultarSi` oculta al cumplirse una regla y `VisibleSi` exige una regla para mostrar. Cambia `Id` al duplicar un objeto persistente para que no comparta su recogida o derrota con el original.

## Combate

En `arena`, A/D o toque mueve; S/flecha abajo mantiene a Sofía agachada; el control táctil permite alternarlo. F o «Pulso» ataca. Espacio permite un salto manual en interiores, nunca en planetas. Las balas altas pueden evitarse agachándose. Un impacto cambia temporalmente el color y muestra daño y vida; la salud usa el comportamiento oficial `Salud`. Al perder toda la vida se puede reintentar.

Duplica `Enemigo`, cambia su imagen, identificador, vida en `Salud` y las variables de daño, intervalo, alcance, velocidad y patrulla. `Otorga` marca el resultado al vencerlo. Un NPC de conversación no se convierte automáticamente en enemigo.

## Alcance real

Esto adapta recursos, escenas y conversaciones: **no es todavía una equivalencia completa de Phaser**. No migra sus partidas ni sus borradores locales, su editor, los minijuegos HTML, el atlas, los modos Historia/Libre o las colecciones. Las actividades no soportadas se anuncian como pendientes, nunca como completadas. La secuencia narrativa íntegra de Platón necesita una prueba de extremo a extremo; no se declara equivalente solo por importar los textos.

El vuelo está adaptado al runtime de GDevelop: usa el arte de la nave y los planetas existentes, con despegue, sobrevuelo ordenado y descenso. No ejecuta el código Phaser ni reproduce todavía todos sus detalles de cámara/cabina. El emisor y los proyectiles reutilizan arte existente como representación provisional; no hay una nueva animación dibujada de Sofía disparando. Agacharse sí utiliza fotogramas del autor.

El guardado es independiente (`sofia-gdevelop-autonomia-v1`). Reiniciar esta plantilla no borra las partidas de Phaser. Antes de esta importación se guardó una copia de `game.json` en `backups/`. No ejecutes los generadores sobre tus cambios de autor: trabaja desde GDevelop y guarda el proyecto.

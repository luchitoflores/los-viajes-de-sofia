# Evaluación de migración y trabajo entre nube y escritorio

## Alcance real

El autor aclara que **no se migra ni se reconstruye el editor propio de Phaser**. La edición de escenas/objetos utilizará las herramientas nativas de GDevelop o Godot; la autoría narrativa, Yarn o un complemento integrado. Solo se migra el juego y sus datos/comportamientos.

Con ese alcance, la dificultad es media: copiar imágenes y textos es sencillo; física radial, eventos, persistencia y pruebas siguen necesitando adaptación. La demo de GDevelop con Yarn es una prueba funcional abreviada: no contiene todo el motor Phaser ni prueba equivalencia del capítulo completo.

| Parte | Dificultad relativa / trabajo |
| --- | --- |
| Imágenes, fondos, sprites y audio | Baja: reutilizar archivos y ajustar anclajes |
| Escenas, instancias y zonas | Media: transformar datos a objetos/capas del editor |
| NPC, objetos y conexiones | Media: componentes con propiedades y eventos reutilizables |
| Diálogos | Media: convertir nodos/condiciones/recompensas a Yarn y conectarlos con el estado |
| Física radial, cámara y nave | Alta: adaptar controladores conservando pies, escala y direcciones |
| Progreso, partidas y rescate en varios actos | Alta: equivalencia de estados, regresos y guardado |
| Herramientas del editor propio | Fuera de alcance: usar las herramientas nativas, sin reconstruirlas |
| Framework HTML de minijuegos | Media: adaptador web de inicio, pausa, resultado y cierre; aún pendiente |

Orden recomendado: preparar NPC, objeto, paso/puerta y portal comunes; trasladar el capítulo completo de Platón; comparar guardado y recorridos; probar que el autor puede editarlo sin Codex; luego migrar el resto por datos. No mantener tres implementaciones completas en paralelo ni prometer una conversión automática sin pérdida.

Como orden de magnitud preliminar de trabajo de ingeniería, reservar 40–80 horas para un primer capítulo equivalente con componentes comunes, y 80–160 o más para trasladar lo jugable actual incluyendo modos, viaje, inventario, guardados y regresiones. No son horas medidas ni un presupuesto cerrado; una auditoría de alcance puede cambiar mucho el rango. No incluyen crear treinta mundos futuros, el editor propio ni un editor nuevo de minijuegos. Tampoco equivalen al tiempo de una sesión ni a créditos de Codex; no hay una conversión fija entre esos valores.

## Herramientas existentes, sin un editor nuevo

- GDevelop: [objetos personalizados/prefabs](https://wiki.gdevelop.io/gdevelop5/objects/custom-objects-prefab-template/), comportamientos, eventos externos y Yarn/Dialogue Tree. Son las piezas nativas para reutilizar un NPC o puerta en muchas escenas.
- Godot: escenas instanciadas, recursos exportados y señales; para narrativa, [Dialogic](https://github.com/dialogic-godot/dialogic) ofrece autoría visual y [Dialogue Manager](https://github.com/nathanhoad/godot_dialogue_manager) ofrece guion ramificado, condiciones y localización. Elegir uno y una versión compatible; no instalar ambos por defecto.

Estas herramientas automatizan/reutilizan partes del desarrollo, no convierten por sí solas el juego Phaser ni infieren su lógica de misiones.

## Componentes que habría que preparar

- NPC: identidad, recurso visual, nodo Yarn, condición de presencia y conversación pendiente.
- Objeto: apariencia/zona, descripción, acción, recogida y persistencia.
- Paso/puerta: destino, punto de llegada, dirección, condición y modo de activación (caminar o tocar).
- Portal: destino especial, condición, regreso y presentación.
- Actividad: ID, presentación, resultado y consecuencia en el progreso.

La demo actual conserva movimiento/interacciones en JavaScript y un NPC reconocido por escena. Yarn ya permite editar conversaciones, pero esos componentes visuales completos todavía no están migrados.

## Abrir el mismo proyecto desde web y escritorio

1. En GDevelop de escritorio, iniciar sesión y abrir el proyecto local (`sofia_gdevelop/game.json` en la demo).
2. Usar **Archivo → Guardar como → GDevelop Cloud** y completar la subida de los recursos. Verificar que también se incluye el JSON Yarn y que la vista previa funciona.
3. En [editor.gdevelop.io](https://editor.gdevelop.io/), entrar con la misma cuenta y abrir ese proyecto de la nube.
4. En escritorio, abrir ese mismo proyecto desde Cloud para continuar. Guardar antes de cambiar de dispositivo; evitar editar dos copias simultáneamente.
5. Conservar una copia local/versionada del proyecto y recursos. Los límites de proyectos y servicios dependen del plan.

Guardar un proyecto en Cloud no equivale a publicar un enlace para jugar. GitHub Pages publica el juego exportado; no transforma automáticamente sus archivos en un proyecto editable de GDevelop.

## Cómo entra Codex en este flujo

Codex trabaja sobre archivos locales. Una edición en la carpeta local no se sincroniza automáticamente con el proyecto de GDevelop Cloud. Antes de pedir cambios, obtener una copia actual del proyecto; después abrir la copia modificada en escritorio, probarla y guardarla en la nube según las opciones del editor. Conservar un respaldo antes de reemplazar una versión. No volver a subir un JSON antiguo sobre las últimas ediciones del autor.

Fuentes: [sincronización entre dispositivos de GDevelop](https://gdevelop.io/features), [guardar un proyecto local como Cloud](https://forum.gdevelop.io/t/is-there-a-way-to-turn-regular-projects-into-cloud-projects/56995). Los pasos pueden variar ligeramente según idioma/versión del editor.

# Regreso desde vistas previas y trabajo en la nube

## Corrección del regreso

La acción `return` ya no queda sin efecto al ejecutar directamente una habitación desde el editor. Si existe historial válido, lo respeta. Si la vista previa no ha cruzado una entrada, utiliza `RegresoSinHistorial` o `Superficie`, configurados en las variables de la escena. El regreso desde A vuelve así a Platón incluso al probar A de manera aislada.

Los ejercicios `inicio`, `galeria`, `arena`, `salida` y `Plantilla` tienen un portal azul hacia la superficie de Platón. El portal antiguo de salida llevaba a `inicio`, un ejercicio sin nave: se ha corregido. Desde la superficie se puede tocar la nave y elegir otro destino. El portal final de `plato__salida` conserva su requisito `aventura_platon_completada`. Para probar esa habitación sin completar la misión, el control «↑ Planeta · prueba» permite salir a la superficie: solo aparece en vistas previas del editor y queda oculto en las exportaciones publicadas. No concede objetivos ni elimina requisitos.

Antes de reabrir un archivo actualizado externamente, guardar cualquier edición pendiente de GDevelop como otra copia: el editor abierto mantiene su versión en memoria y puede volver a escribirla sobre el archivo corregido.

Validación: exportador nativo de vistas previas GDevelop 5.6.287, comenzando sin historial en `plato__entrada`, `salida`, `arena` y `plato__salida`. Regreso correcto en las cuatro; vuelos Platón↔Tierra comprobados desde entrada y arena, esta última con toque emulado. La prueba final mantiene cerrado el portal narrativo antes de usar el control de pruebas. El control se comprobó oculto en una exportación HTML5 normal. TypeScript/Vite compilan. Informe: `public/lab/gdevelop/VALIDACION-REGRESO.json`. Regresión: `tests/browser_gdevelop_preview.py`, con `GDEVELOP_PREVIEW_DIR` y `GDEVELOP_PREVIEW_SCENE` apuntando a la vista previa nativa que se quiere comprobar.

## PC y GDevelop Cloud

1. Abrir el proyecto local completo en GDevelop de escritorio e iniciar sesión.
2. Usar **Archivo → Guardar como** y elegir **GDevelop Cloud**. Conservar la vinculación con el mismo juego si aparece esa opción. Comprobar que se guardaron proyecto y recursos.
3. En el editor web o en otro equipo, iniciar sesión con la misma cuenta y abrir ese proyecto desde los proyectos de la nube. Guardar allí actualiza ese proyecto compartido.

Para traer cambios de la nube a esta carpeta de trabajo: abrir el proyecto cloud en GDevelop de escritorio y usar **Guardar como → equipo/carpeta local**. Guardar una copia completa en una carpeta de intercambio, con imágenes y archivos Yarn/JSON, e indicar esa ruta a Codex para revisar e incorporar los cambios. No basta enviar un `game.json` que apunte a imágenes locales ausentes.

Guardar un proyecto cloud no actualiza automáticamente la copia local del repositorio. Subir un commit a GitHub tampoco actualiza automáticamente el proyecto guardado en GDevelop Cloud. «Vinculado al mismo juego» no significa combinación automática de ambas copias.

Flujo recomendado: una versión principal en Cloud para editar entre web y escritorio; una copia local completa para cambios con Codex. Al finalizar esos cambios, abrir la copia corregida y volver a guardarla en Cloud, comprobando que sea la versión deseada. Evitar editar simultáneamente dos copias divergentes.

Esto comparte diseño y contenido del proyecto. Las partidas jugadas guardadas en el navegador no se sincronizan mediante «Guardar como».

Fuentes oficiales consultadas: [panel del juego y Guardar como](https://wiki.gdevelop.io/gdevelop5/interface/games-dashboard/), [proyectos compartidos y conflictos](https://wiki.gdevelop.io/gdevelop5/collaboration/), [vista previa de escenas](https://wiki.gdevelop.io/gdevelop5/interface/preview/).

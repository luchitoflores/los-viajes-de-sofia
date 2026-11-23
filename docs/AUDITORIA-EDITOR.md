# Auditoría de usabilidad del editor — 22 de noviembre de 2026

Se revisaron el motor de rutas, el dock compartido, las herramientas de habitaciones y la superficie radial. Se conserva el formato de mundos, borradores y partidas.

## Hallazgos y correcciones

| Problema observado | Cambio aplicado |
|---|---|
| Guardar y Deshacer quedaban dentro del panel desplazable | Barra sobre la escena, fuera del lienzo, con Guardar, Deshacer, Rehacer y Probar |
| «Objeto / NPC» no explicaba dónde elegir el recurso | Biblioteca identificada y botón «Colocar este recurso en el escenario», junto al selector |
| Cada clic seguía insertando personajes | Colocación única, regreso a Seleccionar y selección del elemento creado |
| En la superficie, un clic en controles podía llegar al manejador global de colocación | Solo se permite colocar cuando el inicio del toque/clic pertenece al canvas |
| Eliminar quedaba al final del inspector | Acción visible en la barra, nombre de selección y confirmación; recuperación con Deshacer |
| Solo había historial hacia atrás | Rehacer para objetos y zonas de habitaciones y composiciones radiales; un cambio nuevo descarta la rama de rehacer |
| Herramientas mezcladas con configuración y exportación | Herramientas de selección/dibujo sobre la escena; biblioteca y propiedades en lateral; zonas/conversaciones agrupadas y plegables |
| Dibujar dejaba activa la herramienta e impedía reconocer cómo mover el cuadro | Al terminar el rectángulo se vuelve a Seleccionar para mover/redimensionar |
| Cambiar de escena podía duplicar controles reubicados | Restauración del dock y limpieza de acciones temporales al montar la escena |

## Flujo actual

1. Elegir mundo y escena; «Fondo y configuración» permanece junto a esos selectores.
2. En Biblioteca escoger recurso y nombre; pulsar «Colocar este recurso» y tocar el escenario una vez.
3. Seleccionar el elemento para editar propiedades. Su nombre aparece arriba; «Eliminar selección» pide confirmación.
4. Para geometría, escoger Dibujar suelo, obstáculo, escalera o entrada y arrastrar un rectángulo. Los tiradores permiten cambiar su tamaño.
5. Guardar o probar desde la barra. Deshacer/Rehacer trabajan sobre la escena actual; no son navegación por mundos.

## Validación

`tests/browser_editor_workspace.py`: clic real, toque emulado, inserción única, cancelar/aceptar eliminación, Deshacer/Rehacer, dibujo rectangular, barra fuera del escenario, cambio de escena sin duplicar controles y disposición compacta. También comprueba inserción/historial en superficie e ignora clics sobre formularios. Se usa un perfil de navegador aislado; no se editan las partidas o borradores reales del autor. No se probó en un teléfono físico.

Capturas: `captures/editor-reorganizado.png` y `captures/editor-reorganizado-compacto.png`.

## Límites

La biblioteca mantiene el selector de recursos existente; esta revisión no incorpora un explorador de miniaturas ni capas. El historial es acotado a la escena abierta y se reinicia al cambiarla. La geometría sigue siendo manual. Se mantienen importación/exportación y los controles del prototipo antiguo como compatibilidad.

## Ajuste de espacio — 23 de noviembre de 2026

Barra compacta con iconos SVG para Deshacer, Rehacer, Guardar, Importar, Exportar y Eliminar; títulos nativos al mantener el cursor y nombres accesibles para teclado/lector. Herramientas de dibujo con etiquetas abreviadas, navegación y lateral reducidos. A 1536×768 se comprobó navegación de 44 px, herramientas de 64 px y lienzo de aproximadamente 1067×600, sin superposición. En pantallas táctiles estrechas se conservan controles de al menos 36 px de alto. Captura: `captures/editor-compacto-iconos.png`.

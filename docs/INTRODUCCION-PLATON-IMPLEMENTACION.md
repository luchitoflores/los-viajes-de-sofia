# Introducción, búsqueda e inventario funcional de Platón

La linterna está en **A · Entrada de la caverna**, según la corrección explícita del autor. Esta ubicación prevalece sobre la mención de búsqueda en la superficie del diseño anterior.

Después de la presentación, Sofía puede entrar en A para buscarla. Recogerla conserva el ID histórico `lampara-sofia` y la marca `lampara_encendida` como adquisición; el encendido real se consulta mediante `equipment:lamp:on`. Se recoge apagada. Hay que regresar a Platón para obtener permiso y encenderla para entrar en B. Apagarla nunca impide salir de A o volver a buscar el permiso.

El objetivo tiene etapas con condiciones y un icono inicialmente desconocido. La recogida usa el recurso actual, animación hacia Sofía, aviso temporal y sonido respetando los ajustes. Las partidas avanzadas recuperan propiedad y permiso sin reiniciar ni forzar el encendido.

El inventario conserva identidad, descripción, procedencia y estados aunque se retire la aparición del objeto del escenario. Las operaciones usar/equipar/guardar/entregar ejecutan acciones del motor, condiciones y consecuencias; entregar puede exigir un personaje cercano y consumir el objeto. Se configura en Mundos y escenarios → Objetos de aventura. Las etapas se editan en Eventos y objetivos. El editor y sus pruebas no escriben progreso jugado.

Datos: `public/worlds/plato-search-introduction.json`, `inventoryItems`, `missions[].stages`. La migración conserva diálogos personalizados, recompensas y cadenas posteriores de acciones.

La documentación de validación debe consultarse para distinguir pruebas ejecutadas de dependencias todavía pendientes.


## Validación ejecutada

`tests/browser_plato_search.py` aprobó en escritorio la primera presentación, silueta del objeto, acceso a A, bloqueo de B antes del permiso, recogida animada, cambio de objetivo, equipar/usar/guardar, regreso a Platón, bloqueo de B con la luz apagada, entrada iluminada y recarga conservando su estado. En pantalla horizontal con toque emulado se reanudó una copia después de la recogida y se comprobaron equipar/usar/guardar, regreso a Platón, permiso y entrada iluminada en B. El vuelo se comprobó respetando movimiento reducido; la recogida animada se comprobó con movimiento normal. No se usaron partidas reales ni se probó un teléfono físico.

Las pruebas puras de inventario y etapas forman parte de las 134 pruebas aprobadas del proyecto.

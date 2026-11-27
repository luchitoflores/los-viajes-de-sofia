# Plantilla maestra de Sofía v2.0.0

Abre plantilla-plataformas.json en GDevelop 5.6.287 o superior y conserva assets/. Proyecto independiente de game.json.

**Flujo:** planeta circular → aventura de plataformas → ERCA → capítulo → planeta. La caverna de esta plantilla es una maqueta, no las cinco habitaciones del guion definitivo.

- Planeta: radio, centro y velocidad angular editables; A/D o flechas, espacio y E; botones táctiles. Cinco puertas, solo la caverna conduce a un nivel. Otras puertas son marcadores. Cambiar ángulos y posiciones juntos.
- Plataformas: conserva cinco capas, controles, suelos, muros, escaleras, antorcha, fragmento y checkpoint. F/Ataque: golpe, efecto visual, retroceso y proyectil del enemigo opcional (Dispara). Animación provisional reutiliza caminar; arte y máscaras necesitan ajustes.
- Yarn: Inicio, Observar, Consejo; 1/2 o botones, E avanza texto. Elección persistente; diferentes orientaciones, sin penalización.
- ERCA: seis retos editables en grupos 02/03, elección de respuestas, asociación conceptual, reflexión abierta de opción múltiple, aplicación, reintentos, metacognición. No es aún un motor de minijuegos gráficos ni cubre la caverna definitiva. Fragmento físico distinto del capítulo, que solo se obtiene al completar pruebas.
- Storage SofiaPlantillaV2: guarda siete variables globales por hitos. Etapa 0 inicio; 1 aventura (se repite si sales); 2 cierre ERCA (se reanuda desde el principio); 3 capítulo completado. Inventario global de prueba con flags, no cantidades arbitrarias ni guardado exacto de posición/vida/enemigos. Nueva partida requiere confirmación. Guardado local, no nube.
- Integración de las dos plantillas en un proyecto independiente, no migración del juego previo.

## Pruebas pendientes
Abrir y ejecutar cada escena en GDevelop; verificar movimiento 360°, salto, controles, colisiones, Yarn y opciones, proyectiles, daño, checkpoint, cambios de escena, respuesta incorrecta, guardado/recarga, capítulo único, reset y móvil. Solo se comprobaron estructura JSON y referencias de objetos/capas/recursos, no ejecución ni exportación HTML5. Las otras cuatro aventuras, arte definitivo y animación de ataque propia, minijuegos gráficos y migración del juego real siguen pendientes.
Referencias: https://wiki.gdevelop.io/gdevelop5/all-features/storage/reference/ y https://wiki.gdevelop.io/gdevelop5/all-features/dialogue-tree/reference/ .

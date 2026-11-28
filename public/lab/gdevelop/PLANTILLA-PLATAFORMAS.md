# Plantilla maestra de Sofía v2.2.0

Abre plantilla-plataformas.json en GDevelop 5.6.287 o superior y conserva assets/. Proyecto independiente de game.json.

**Flujo:** planeta circular → aventura de plataformas → minijuegos visuales → ERCA → capítulo → planeta. La caverna de esta plantilla es una maqueta, no las cinco habitaciones del guion definitivo.

- Planeta: radio, centro y velocidad angular editables; A/D o flechas, espacio y E; botones táctiles. Cinco puertas, solo la caverna conduce a un nivel. Otras puertas son marcadores. Cambiar ángulos y posiciones juntos.
- Plataformas: conserva cinco capas, controles, suelos, muros, escaleras, antorcha, fragmento y checkpoint. F/Ataque: golpe, efecto visual, retroceso y proyectil del enemigo opcional (Dispara). Animación provisional reutiliza caminar; arte y máscaras necesitan ajustes.
- Yarn: Inicio, Observar, Consejo; 1/2 o botones, E avanza texto. Elección persistente; diferentes orientaciones, sin penalización.
- ERCA: seis retos editables en grupos 02/03, elección de respuestas, asociación conceptual, reflexión abierta de opción múltiple, aplicación, reintentos, metacognición. Las preguntas no cubren la caverna definitiva. Fragmento físico distinto del capítulo, que solo se obtiene al completar pruebas.
- Storage SofiaPlantillaV2: guarda ocho variables globales por hitos. Etapa 0 inicio; 1 aventura (se repite si sales); 2 cierre visual/ERCA (se reanuda desde el principio de la sección pendiente); 3 capítulo completado. Inventario global de prueba con flags, no cantidades arbitrarias ni guardado exacto de posición/vida/enemigos. Nueva partida requiere confirmación. Guardado local, no nube.
- Integración de las dos plantillas en un proyecto independiente, no migración del juego previo.

## Pruebas pendientes
Abrir y ejecutar cada escena en GDevelop; verificar movimiento 360°, salto, controles, colisiones, Yarn y opciones, proyectiles, daño, checkpoint, cambios de escena, respuesta incorrecta, guardado/recarga, capítulo único, reset y móvil. Solo se comprobaron estructura JSON y referencias de objetos/capas/recursos, no ejecución ni exportación HTML5. Las otras cuatro aventuras, arte definitivo y animación de ataque propia, ampliación de minijuegos gráficos y migración del juego real siguen pendientes.
Referencias: https://wiki.gdevelop.io/gdevelop5/all-features/storage/reference/ y https://wiki.gdevelop.io/gdevelop5/all-features/dialogue-tree/reference/ .

## Minijuegos visuales v2.1
Escena Plantilla_Miniguegos, tres ejercicios: reconocer la vasija girada, relacionar sombra con copa de color, ordenar antorcha → fragmento → portal. Tres cartas Sprite editables con animaciones (índices 0–8), modelo y número por opción. Grupo 02 configura contenido, grupo 03 define respuestas y orden. Selecciona con 1/2/3 o pulsando carta. Error no avanza. Tras completar los tres, se guarda ViajeVisual=1, se abre ERCA y el capítulo exige ambas secciones. Salir permite retomar desde inicio de la sección. PNG de ejemplo, no ilustración definitiva. No es todavía un catálogo configurable sin editar eventos. No se ejecutó GDevelop; comprobar clics, rotación, imágenes, transición y guardado.

## Laboratorios visuales v2.2 — sombras y río
Desde el planeta aparecen dos botones de laboratorio independientes; no cambian capítulos, misiones ni la caverna aprobada. También puedes seleccionar sus escenas y usar Vista previa en GDevelop.

| Capa | Función | Factor cámara |
|---|---|---|
| FondoLejano | Siluetas lejanas / cielo | 0.16 |
| FondoMedio | Paredes de caverna / árboles y valle | 0.42 |
| Ambiente | Sombras que oscilan o corriente animada | 0.67 |
| Base | Sofía, plataformas, islas, muros, pasadizos, escaleras, peligros | 1 |
| PrimerPlano | Elementos decorativos próximos | 1.12 |
| UI | Controles y avisos | fija |

SueloRoca y MuroRoca son Tiled Sprites sólidos; PlataformaRoca es Jumpthru; Escalera es Ladder; BordeDecorativo se coloca sobre cada bloque y no tiene colisión. Pinchos causan reintento. El río carece de suelo bajo las islas: al bajar de Y=635 hay reintento desde checkpoint. ZonaAgua es auxiliar invisible sin colisión física; AguaCorriente usa XOffset continuamente. Las sombras reutilizan los sprites de caballo, árbol y guerrero de Phaser, ahora en una capa sin física, con oscilación mediante OrigenX/OrigenY/Fase. Cada instancia se puede mover visualmente; ajustar también OrigenX/OrigenY para conservar su centro de animación. Los fondos nuevos son PNG de maqueta procedural, independientes del suelo, no arte final con calidad Hollow Knight. El primer plano no bloquea movimiento.

### Cómo crear otro recorrido
Duplica una escena de laboratorio. Arrastra SueloRoca, PlataformaRoca, MuroRoca, Escalera y BordeDecorativo; redimensiona por separado. Deja huecos reales entre bloques; no agregues un suelo invisible debajo de los peligros. Modifica velocidad/salto/gravedad en Sofia > PlatformerObject, límites de cámara, umbral de caída y coordenadas de checkpoint. Reemplaza texturas repetibles de cada objeto o las imágenes de fondo; conserva comportamientos. Para cambiar el río a lava usa otra textura y conserva el umbral de caída. Portal y botón Volver retornan al planeta, sin otorgar capítulos. Los fondos son composiciones modulares de muestra; no se ha ejecutado GDevelop ni verificado visualmente el salto, la corriente, los pasadizos, las colisiones o el parallax. Probar en editor antes de usar en una aventura. Las escenas conservan el sistema de pruebas previo.

## v2.3.0 · Caverna pintada y catálogo nativo
Desde el planeta: Lab · Caverna pintada o Catálogo caverna. La escena Laboratorio_Mundo_Sombras conserva a Sofía, sus controles, las colisiones nativas, el retorno, checkpoint, huecos y sombras en movimiento. Se sustituyen bloques de maqueta por 21 imágenes de pintura digital, optimizadas en WebP (piezas con máximo 96 px y fondos 256×96 para la primera integración; no son los PNG maestros a resolución original). El kit está en assets/caverna-pintada/. SueloRoca/MuroRoca son Tiled Sprites; PlataformaAncha/Flotante y PuenteMadera usan Jumpthru con máscara superior; RocaBloque/ColumnaMuro son sólidos; EscaleraPintada Ladder. Pinchos tienen máscara y evento de reintento; esquinas, cadenas, columnas decorativas, estalactitas y antorchas son arte sin colisión salvo las instancias de ColumnaMuro situadas en la capa jugable. La composición de las capas deja visible el fondo lejano: no hay un fondo opaco ocupando todo el plano medio. El panel cálido tiene sombras pintadas y se mantienen sombras móviles separadas; no es una animación por fotogramas de las figuras. Se reutilizan texturas de suelo y agua en Heráclito sin sustituir su diseño. Catálogo_Caverna_Pintada (nombre interno Catalogo_Caverna_Pintada) muestra las piezas con sus nombres y comportamientos. Las dos escenas se editan directamente en la plantilla principal. El videojuego Phaser y game.json no se modifican. Validación: todos los recursos existen, máscaras y referencias estructuralmente válidas, sin ejecución en GDevelop; revisar saltos, máscaras, escalera, portal y acabado en vista previa antes de publicar.

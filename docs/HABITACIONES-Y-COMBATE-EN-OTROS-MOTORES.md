# Habitaciones conectadas y combate, sin reconstruir un editor

## Qué se necesita

Una aventura 2D con habitaciones conectadas, condiciones de paso, portales especiales, NPC y encuentros de combate. No requiere adoptar toda la estructura de un metroidvania ni hacer obligatorios saltos, mejoras de movimiento o combate en cada habitación. La superficie circular sigue siendo una capacidad aparte.

## Demos actuales

GDevelop y Godot muestran superficie, A y B. A→B se cruza caminando hacia la derecha; exige haber recogido y encendido la linterna. B→A se cruza hacia la izquierda. El regreso aparece cerca del acceso derecho, mirando hacia el interior de A; la llegada a B aparece cerca de su extremo izquierdo. La dirección y el punto de llegada evitan regresar automáticamente al entrar.

La recogida, luz y resultado de conversación se conservan durante la sesión. Un bloqueo muestra un aviso breve y no abre una conversación. El portal azul visible de A devuelve a la superficie mediante clic/toque o Enter estando cerca; caminar a su lado no lo activa. Es el primer fotograma del recurso propio de Phaser, no una animación nueva.

Enter sigue avanzando conversaciones; Tab y Enter confirman decisiones. El cambio de habitación no requiere Enter ni hacer clic en una puerta inexistente.

### Parametrización nativa

- GDevelop: variables de escena `ExitTarget`, `ExitX`, `ExitDirection`, `ArrivalX`, `NeedsLight`. Los objetos y recursos se editan en sus escenas normales.
- Godot: propiedades exportadas del nodo raíz, grupo **Paso caminando**: `exit_target`, `exit_x`, `exit_direction`, `arrival_x`, `exit_needs_light`.

Estas demos usan un paso por habitación. No representan un sistema de mapas de múltiples conexiones completamente migrado. No incluyen todavía el combate, rescate completo ni guardados persistentes de Phaser. Cambiar de motor no requiere migrar el editor propio.

## Herramientas existentes para evaluar

| Opción | Qué aporta | Qué no debe darse por hecho |
| --- | --- | --- |
| Godot: MetSys / Metroidvania System | Diseño de mapas por habitaciones, navegación, IDs persistentes y datos de guardado; admite usar componentes sin que el juego sea un metroidvania | No es el combate ni una importación de Phaser; hay que conectarlo al jugador y al estado de Sofía |
| Godot: Room Toolkit | Límites de cámara, carga de escenas y transiciones para habitaciones 2D | Es una alternativa acotada, no un motor de misiones/combate completo |
| Godot: Metroidvania Developer System | Su documentación anuncia un editor integrado y Gameplay Kit con movimiento, combate, enemigos, equipo y reaparición | Candidato de evaluación: no se ha instalado ni validado con Sofía, sus escenas o exportación web |
| GDevelop: Health points and damage + Checkpoints + componentes reutilizables | Vida, daño, protección temporal y reaparición; composición con enemigos, ataques y accesos mediante eventos visuales | No se ha incorporado ese combate a la demo ni se asegura una plantilla universal ya integrada |

Para una prueba de adopción: conectar dos habitaciones, bloquear un paso por una bandera y crear un encuentro que registre la victoria y deje volver sin repetirla. Probar muerte, reintento, salida/regreso y guardado. Después decidir si el framework ahorra trabajo frente a componentes pequeños; no sustituir todo el juego por un paquete sin esa prueba.

El contrato de combate necesario sigue siendo sencillo y configurable: salud, daño, hitbox/hurtbox, intervalo de ataque, invulnerabilidad temporal, proyectil o contacto, condición de inicio, derrota/reintento y bandera de victoria. Las actividades educativas y los diálogos se conectan a esos resultados sin mezclarse con la detección de golpes.

## Fuentes consultadas

- [MetSys en la biblioteca oficial de Godot](https://godotengine.org/asset-library/asset/2301). La ficha indica que sus actualizaciones están en la nueva tienda o GitHub.
- [Room Toolkit](https://github.com/L-french/room-toolkit).
- [Metroidvania Developer System y Gameplay Kit](https://github.com/arunsrajan/MetroidvaniaDeveloperSystem).
- [GDevelop: Health points and damage](https://wiki.gdevelop.io/gdevelop5/extensions/health/).
- [GDevelop: Checkpoints](https://wiki.gdevelop.io/gdevelop5/extensions/checkpoints/).

La lectura de documentación no equivale a validar esos complementos en este proyecto. Las pruebas realizadas corresponden al controlador actual de las demos.

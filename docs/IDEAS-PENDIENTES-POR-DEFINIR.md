# Banco de ideas y decisiones pendientes · Sofía y los mundos de las ideas

> **Estado:** ideas para estudiar y decidir más adelante. **NO son funcionalidades aprobadas para programar ni equivalen a tareas ya implementadas.** Registro: 24 de noviembre de 2026.
>
> Objetivo de este archivo: conservar propuestas creativas sin convertirlas automáticamente en requisitos ni consumir créditos de Codex antes de definirlas. Las decisiones confirmadas permanecen en [Decisiones de diseño](DECISIONES-DE-DISENO.md), [Gameplay Core](GAMEPLAY-CORE-SOFIA.md), [Controles y equipamiento](CONTROLES-Y-EQUIPAMIENTO.md) y demás documentos del repositorio.

## IDEA-001 · Cada planeta entrega un pergamino que también puede desbloquear habilidades

**Estado: PENDIENTE DE DEFINIR.** Inspiración conceptual: progresión de habilidades y exploración tipo *Hollow Knight*, adaptada a un juego educativo de filosofía.

### Hipótesis de diseño
- Cada filósofo tiene **un pergamino coleccionable** con los aprendizajes de su mundo (conceptos, folios, evidencias y preguntas de reflexión).
- Además del contenido educativo, el pergamino **podría** desbloquear una **habilidad activa, una mejora de habilidad existente, una interacción especial o una combinación**. No prometer una habilidad mecánica completamente distinta para cada filósofo.
- La habilidad adquirida podría reutilizarse al visitar otros planetas, dando continuidad a lo aprendido: ejemplos de puzles, exploración, investigación o conversaciones.
- Conservar la distinción entre **pergaminos de conocimiento** (coleccionables potencialmente numerosos) y **habilidades equipables** (pocas y seleccionables). **El número de espacios y las reglas de equipamiento no están decididos**.
- No todos los aprendizajes tienen que otorgar movimiento físico: investigar, iluminar, comparar, dialogar o cooperar también son acciones del juego.
- Si un jugador visita los planetas en un orden diferente, los aprendizajes principales **no deben quedar bloqueados** por la ausencia de un pergamino externo; las habilidades cruzadas pueden abrir secretos, desafíos adicionales o rutas alternativas.

### Primeros ejemplos que habrá que comprobar filosófica y técnicamente
| Pergamino | Habilidad / experiencia propuesta | Mecánica reusable | Precaución filosófica |
|---|---|---|---|
| **Platón** | **Luz de la razón:** revelar fuentes de sombras y mecanismos ocultos usando una lámpara o pulso luminoso | Iluminación + examinar/revelar | El mito no plantea destruir sombras; plantea comprender su carácter de apariencia. **La lámpara ya cuenta con desarrollo propio en el juego:** reutilizarlo. |
| **Heráclito** | **Visión del cambio:** observar o activar transiciones de estado para identificar qué cambia y qué persiste | Estados y transformaciones de objetos | El ejemplo del río pertenece a Heráclito, no a Platón; el *logos* no equivale a mero caos. |
| **Sócrates** | **Escudo de argumentos:** examinar afirmaciones, detectar contradicciones o formular contraejemplos | Diálogos, argumentos y adaptador del framework de preguntas | No reducir el diálogo socrático a «tener siempre la respuesta correcta». |
| **Marx** | **Acción colectiva:** coordinar NPC y activar mecanismos que una persona no puede resolver sola | Seguimiento/colaboración de NPC + eventos | No reducir su pensamiento a un puzle de máquinas. |
| **Nietzsche** | **Autosuperación:** impulso simbólico o acceso a retos nuevos, tras confrontar valores asumidos | Movimiento/impulso y decisiones | El superhombre no es un monstruo ni una mejora biológica o mero poder muscular. |

Estos son **candidatos**, no distribución definitiva ni habilidades implementadas.

### Catálogo inicial de familias que podrían cubrir muchos planetas
La propuesta anterior mencionó unas **12 familias** (no obliga a construirlas todas):
1. Iluminar/revelar.
2. Examinar e investigar.
3. Elegir y alterar consecuencias.
4. Observar/alterar estados.
5. Conectar y relacionar.
6. Defender o contrastar argumentos.
7. Apuntar/lanzar/disparar herramientas o señales.
8. Manipular, empujar y combinar objetos.
9. Cooperar y persuadir a NPC.
10. Cambiar de perspectiva.
11. Superar obstáculos mediante capacidades de movimiento.
12. Construir, reconstruir y reparar.

**Regla provisional para evaluar:** la familia de habilidad pertenece al Gameplay Core; el significado y la prueba de aprendizaje se definen en el mundo y/o Framework de Preguntas. El pergamino registra la adquisición en el sistema de colección/progreso. No crear un sistema paralelo de física, diálogo, luces o gamificación para cada autor.

### Combinaciones entre planetas (idea a prototipar)
Ejemplo: **Luz de Platón + Visión del cambio de Heráclito** permiten investigar un mecanismo oculto que cambia de estado. El reto combinado debe ser opcional o tener alternativa para no imponer un orden curricular rígido.

### Preguntas ABIERTAS (no decidir todavía)
- ¿**Cada** pergamino da una habilidad, o algunos otorgan mejoras, conocimiento, equipo o acceso narrativo?
- ¿Habilidad al completar la experiencia principal, al completar todos los folios, o por un logro intermedio?
- ¿Las habilidades son permanentes, equipables, pasivas o consumibles? ¿Cuántas ranuras?
- ¿Se usan todas en exteriores circulares e interiores laterales, o solo donde el perfil de movimiento lo permite?
- ¿Cómo mostrar habilidades desde el móvil sin sobrecargar joystick y botón contextual?
- ¿Cómo registrar combinaciones y versiones de habilidades sin romper partidas?
- ¿Cuándo corresponde un desafío pedagógico del framework de preguntas y cuándo una habilidad de exploración?
- ¿Cómo evitar asociaciones superficiales entre autores y poderes que no representan fielmente sus teorías?

### Criterio para decidir más adelante
Preparar **un prototipo pequeño con dos pergaminos y una combinación**, aprovechando la lámpara de Platón y un objeto de estados variables. Medir si la habilidad hace más interesante el aprendizaje, si funciona en móvil y si el sistema requiere poco código adicional. **No encargar de momento decenas de habilidades ni diseñar una mecánica exclusiva para cada filósofo.**

### Conexión con trabajos actuales
- Caverna de Platón: [CAVERNA-JUGABLE.md](CAVERNA-JUGABLE.md), [CONTROLES-Y-EQUIPAMIENTO.md](CONTROLES-Y-EQUIPAMIENTO.md).
- Constructor de mecánicas: [DECISIONES-EDITOR-VISUAL-MECANICAS-REUTILIZABLES.md](DECISIONES-EDITOR-VISUAL-MECANICAS-REUTILIZABLES.md).
- Futuras colecciones de conocimientos y minijuegos: [CURRICULO-MAESTRO-FILOSOFIA-INEVAL-2026.md](CURRICULO-MAESTRO-FILOSOFIA-INEVAL-2026.md).

---

## Uso de este banco de ideas
Al incorporar nuevas ideas, registrar un ID, estado (**IDEA / POR INVESTIGAR / POR DECIDIR / APROBADA / DESCARTADA**), fundamento filosófico, mecánica reusable, dependencia técnica y preguntas abiertas. **Solo mover una propuesta al backlog de implementación cuando el autor la apruebe explícitamente.**

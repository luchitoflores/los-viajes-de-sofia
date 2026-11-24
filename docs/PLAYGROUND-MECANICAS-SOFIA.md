# Playground de mecánicas de Sofía — prototipo Phaser 3

**Fecha:** 23–24 de noviembre de 2026 · **Estado:** primera implementación aislada (requiere prueba real en navegador).  
**Entrada Vite:** `/playground.html` · **Sin cambios en el progreso ni la narrativa de los planetas.**

## Objetivo

Disponer de un **laboratorio jugable** parecido a los playgrounds del framework de preguntas y del framework de gamificación, para comprobar rápidamente nuevas mecánicas antes de introducirlas en misiones filosóficas. Primero probamos comportamiento; después decidimos qué escena lo necesita.

## Prototipo actual

- Nave gráfica de Sofía reutilizada de `public/assets/polis-ship.png`, fondo espacial `galaxy.jpg` y sala del fuego `plato-03_fuego_y_sombras.png`.
- Controles en teclado **WASD/flechas + espacio**, botones táctiles de dirección y pulso/disparo, orientación principal **landscape**.
- Configuración en el panel: **velocidad de nave** y **cadencia de disparo**, con reinicio sin alterar la partida.
- Aparición gradual de blancos, desplazamiento, detección de impacto 2D, puntuación, feedback filosófico, sin NPC heridos ni vidas consumidas.

| Experiencia | Interacción | Aprendizaje y límite |
|---|---|---|
| **Cazar falacias** | Disparar pulsos a enunciados falaces y **evitar razonamientos adecuados** | Diferenciar ad hominem, ad populum, apelación a ignorancia, falsa causa. El disparo es metáfora de refutar, no ataque a personas. |
| **Iluminar sombras de Platón** | Usar rayos de luz contra sombras de caballo, árbol, figura humana y vasija | Distinguir objeto, fuente luminosa y proyección. En la caverna definitiva debe conectarse con diálogo e investigación, no substituirlos. |
| **Desmontar mala fe de Sartre** | Cuestionar evasiones de responsabilidad evitando castigar el reconocimiento de la facticidad | La libertad no significa carecer de condiciones y límites. La mala fe tiene interpretaciones más profundas que las tarjetas breves. |

**Recursos:** las tarjetas con textos son placeholder de juego, no sprites definitivos; los fondos y la nave proceden de los assets reales del repositorio. Los disparos tienen VFX sencillos; las sombras usan sus sprites existentes.

## Arquitectura técnica

```text
playground.html                       Segunda entrada, UI y controles
src/playground-mecanicas/core.js      Catálogo y reglas de puntuación (sin Phaser)
src/playground-mecanicas/main.js      Adaptador Phaser para mover/disparar/golpear
tests/mechanics-playground.test.mjs   Tests unitarios puros
vite.config.ts                        Multi-page build: index.html + playground.html
```

**Separación intencional:** el `core.js` es la primera pieza reutilizable. El adaptador Phaser y UI siguen siendo de esta demostración y NO son todavía un framework instalable universal, un editor de reglas completo ni un motor 3D.

La lógica de mini-experiencias depende solo de **datos**, de modo que Codex pueda añadir nuevos modos sin duplicar física ni eventos.

### Para Codex: siguientes entregas

1. **Verificar** `npm test`, `npm run build`, imagen/nave a tamaño correcto, móviles reales y continuidad del juego principal. Si falla CI, reparar antes de incorporar más mecánicas.
2. Añadir **editor gráfico de presets** (seleccionar nave/personaje, elegir sprite, velocidad, control, disparo, tipo de blanco, condición y recompensa); guardar e importar/exportar perfiles JSON validados.
3. Añadir perfiles de movimiento `side-scroller-2d` y `radial-2d` **sin sustituir** los controladores actuales de Sofía. Ensayar caminar/correr/saltar primero en el playground.
4. Integrar mini-experiencias con el editor de escenas mediante `activityId` y un **resultado tipado** (aciertos, errores, evidencia). El motor narrativo decide qué puerta, diálogo, logro o folio desbloquear: el playground no escribe flags globales.
5. Conectar con framework de preguntas y gamificación por adaptadores; no recrear sistemas de ambos en el Gameplay Core.
6. Solo después de tener otra app que consuma estas capacidades, extraer un repositorio/paquete independiente y versionado. Preparar contratos para futuros adaptadores 3D, no afirmar que el mismo controlador es 3D.

### Reglas pedagógicas para futuras escenas

- «Doxa» en Platón significa opinión, **no siempre falsedad**. La experiencia debe contrastar opinión y justificación, no destruir indiscriminadamente la doxa.
- Las sombras platónicas son proyecciones que permiten **investigar**; iluminarlas es una metáfora interactiva. La alegoría no termina al disparar.
- La mala fe de Sartre no es un objeto ni un monstruo. No confundir restricciones reales, responsabilidades sociales o vulnerabilidad con mala fe.
- En Nietzsche el superhombre no debe convertirse automáticamente en jefe/enemigo; en Heráclito se requiere experimentar el cambio, no disparar al río.
- Los objetivos son medios didácticos. Bloom depende del tipo de razonamiento y del diálogo/retroalimentación que sigue a la acción.

## Publicación

Vite desarrolla `/playground.html` como página secundaria y debe emitir `dist/playground.html` en `npm run build`. La automatización de GitHub Pages existente ejecuta `npm ci`, `npm test`, `npm run build` y despliega `dist/`.

Ruta prevista en Pages tras una publicación exitosa:

`https://luchitoflores.github.io/los-viajes-de-sofia/playground.html`

**No afirmar que ya está operativo en Pages sin comprobar la ejecución del workflow.** No mover el playground dentro de `public/`: Vite debe transformar su importación de Phaser.

## Alcance y faltantes

- Sin editor de sprites ni presets todavía.
- Las tarjetas y proyectiles usan colisión por coordenadas, no físicas Arcade completas.
- No hay música ni enemigos de combate; sin guardado ni XP persistente.
- Sin prueba visual certificada en celular real al crear esta página.
- Mantener separada la primera implementación y usar el [documento de decisiones del constructor visual](DECISIONES-EDITOR-VISUAL-MECANICAS-REUTILIZABLES.md) como roadmap.

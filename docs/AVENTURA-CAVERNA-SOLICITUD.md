# SOFÍA Y LOS MUNDOS DE LAS IDEAS
## IMPLEMENTAR LA AVENTURA JUGABLE DE LA CAVERNA DE PLATÓN

Actúa como desarrollador experto en Phaser, TypeScript, diseño de niveles 2D y didáctica de la filosofía.

**Objetivo:** convertir las cinco habitaciones ilustradas de la caverna de Platón en una aventura completamente jugable, con exploración, diálogos ramificados, decisiones narrativas y progresión.

**IMPORTANTE: no reconstruyas el proyecto ni elimines funcionalidades existentes.** Conserva el planeta circular de Platón, Sofía, los NPC, la nave, las animaciones, los diálogos y los sistemas que ya funcionan.

Trabaja sobre el proyecto actual. Aprovecha los fondos e imágenes que te proporcionaré.

## 1. MECÁNICA PRINCIPAL

La aventura será un juego de exploración lateral 2D.

Sofía debe poder:

- Caminar a izquierda y derecha.
- Acercarse a personajes y conversar.
- Examinar objetos mediante un botón de interacción.
- Utilizar su lámpara para descubrir zonas oscuras.
- Encender antorchas.
- Abrir puertas cuando cumpla determinadas condiciones.
- Subir escaleras.
- Atravesar habitaciones y regresar.
- Acompañar a un prisionero liberado.
- Tomar decisiones que modifiquen conversaciones y acontecimientos.

**No implementar todavía minijuegos independientes.** Toda la progresión filosófica se resolverá mediante diálogos, investigación, decisiones y eventos narrativos.

## 2. CONFIGURACIÓN GRÁFICA Y MOVIMIENTO

El juego es mobile first, en orientación horizontal, y también debe funcionar en computadora.

- Resolución lógica: 1280 × 720.
- Fondos: 1920 × 1080.
- Utilizar una imagen principal por habitación.
- Sofía y los NPC serán sprites independientes.
- Suelo principal: Y = 560 en coordenadas lógicas.
- Mantener plataformas y colisiones alineadas con el suelo visible.
- No detectar superficies caminables automáticamente a partir de las ilustraciones.

Las habitaciones A, B, C y E tendrán suelo plano. La habitación D incluirá escaleras y diferentes alturas.

No agregues saltos obligatorios hasta comprobar que el controlador de salto funcione correctamente con teclado y controles táctiles. Inicialmente debe poder completarse la aventura caminando y subiendo escaleras.

Si incorporas saltos y abismos, utiliza una mecánica universal y comprobada, con puntos de control.

## 3. HABITACIONES Y CONEXIONES

### A. ENTRADA DE LA CAVERNA

**Función:** introducir a Sofía en el mundo oscuro.

Sofía entra desde la superficie circular del planeta de Platón.

La habitación presenta iluminación tenue y una atmósfera misteriosa.

Acciones:
- Explorar el lugar.
- Encender su lámpara.
- Examinar una antorcha o inscripción.
- Escuchar voces procedentes del interior.

**Diálogo inicial de Sofía:**

«Aquí casi no se ve nada... ¿Quiénes vivirán en un lugar tan oscuro?»

Al avanzar descubre el acceso a la sala B.

Conexiones:
- Regreso al planeta circular.
- Entrada a la sala B.

### B. SALA DE LOS PRISIONEROS

**Función:** presentar el problema de las apariencias.

La habitación comienza casi completamente oscura.

La lámpara de Sofía ilumina un círculo alrededor de ella. Al acercarse a los prisioneros descubre sus rostros, sus cadenas y la pared donde contemplan sombras.

Utiliza sprites independientes para representar a los prisioneros. Mantén su estilo visual coherente con Sofía, Platón y el NPC prisionero existente.

Uno será el personaje principal de la aventura y tendrá identidad permanente.

**Ejemplo de diálogo:**

Sofía: «¿Por qué permaneces mirando esa pared?»

Prisionero: «Porque allí está todo lo que conocemos».

Sofía: «¿Nunca has pensado que podría existir algo detrás de esas sombras?»

Prisionero: «¿Detrás? ¿Qué podría existir más allá de la realidad?»

Ofrecer respuestas ramificadas que permitan a Sofía investigar lo que creen los prisioneros.

Al principio el prisionero no acepta abandonar su lugar.

Sofía deberá investigar el origen de las sombras antes de poder liberarlo.

Conexiones:
- Sala A.
- Sala C.
- Sala D, cuyo acceso narrativo estará bloqueado hasta liberar al prisionero.

### C. SALA DEL FUEGO Y LAS SOMBRAS

**Función:** descubrir cómo se producen las sombras.

Aquí Sofía encuentra el fuego, los objetos que pasan delante de él y las proyecciones que observan los prisioneros.

Objetos examinables:
- Fuente de fuego.
- Figura de caballo.
- Vasija.
- Figura humana.
- Muro de proyección.

Cada interacción debe activar una breve observación o conversación.

**Ejemplo:**

Sofía: «¡Ahora entiendo! Lo que ellos ven son sombras de estos objetos».

Un personaje puede plantear:

«Si alguien ha visto únicamente sombras durante toda su vida, ¿cómo podrías convencerlo de que existe algo más?»

Presentar varias opciones de diálogo, con explicaciones distintas según la elección.

No mostrar «respuesta correcta» como en un cuestionario. El objetivo es construir la comprensión mediante una conversación.

Al investigar los elementos necesarios se registra que Sofía comprendió el origen de las sombras.

La interacción permite regresar a B y conversar nuevamente con el prisionero.

### REGRESO A B: LIBERACIÓN

Sofía utiliza lo descubierto para hablar con el prisionero.

El personaje duda, pregunta y manifiesta miedo.

Mediante una conversación progresiva, Sofía consigue que acepte intentar abandonar la caverna.

Se activa una interacción con las cadenas y una animación sencilla de liberación.

El prisionero se levanta y comienza a acompañar a Sofía.

**No generar otro NPC:** utilizar la misma identidad del prisionero y cambiar su estado de encadenado a liberado.

Se desbloquea el camino D.

### D. CAMINO DEL ASCENSO

**Función:** representar el esfuerzo de abandonar las apariencias.

Sofía y el prisionero recorren una habitación con escaleras y plataformas.

La iluminación aumenta progresivamente al aproximarse a la salida.

El prisionero puede detenerse y conversar:

Prisionero: «La luz me lastima. Quiero regresar».

Sofía: «Es normal que algo desconocido resulte difícil. ¿Quieres continuar?»

Utiliza estos encuentros para mostrar el proceso de adaptación y aprendizaje.

Las escaleras deben funcionar mediante un controlador reutilizable, sin programar movimientos exclusivos para Platón.

El prisionero debe seguir a Sofía, subir las escaleras y aparecer correctamente al cambiar de habitación.

Evita que quede atrapado por diferencias de velocidad o colisiones.

Conexiones:
- Regreso a B.
- Ascenso hacia E.

### E. SALIDA LUMINOSA

**Función:** representar el descubrimiento del exterior y la adaptación a la luz.

El prisionero experimenta inicialmente deslumbramiento.

Al avanzar la conversación descubre progresivamente el entorno: primero sombras y reflejos, después objetos y finalmente la luz del sol.

No presentar el conocimiento de las Ideas como simplemente contemplar un paisaje bonito: explicar mediante diálogos que el ascenso representa un proceso intelectual y educativo.

**Diálogo:**

Prisionero: «Nunca imaginé que existiera algo así».

Sofía: «¿Y ahora qué piensas de las sombras que observabas?»

Prisionero: «Creía que eran toda la realidad».

El prisionero expresa su intención de regresar para compartir lo aprendido.

**La misión no termina aquí.**

Se activa el regreso obligatorio a la caverna.

## 4. SEGUNDO ACTO: EL REGRESO DEL PRISIONERO

Sofía y el prisionero recorren nuevamente D y regresan a B.

Se reutilizan las mismas habitaciones, pero cambian los estados narrativos y los diálogos.

Los demás prisioneros reaccionan con incredulidad, burlas y resistencia.

**Ejemplo:**

Prisionero liberado: «He visto el mundo que existe fuera de esta caverna».

Otro prisionero: «¡Imposible! Todo cuanto existe está frente a nosotros».

Prisionero liberado: «Lo que observan son solamente sombras».

Otro prisionero: «La luz te ha confundido. Ya ni siquiera reconoces nuestras sombras».

Crear una conversación ramificada en la que Sofía pueda intervenir, explicar lo descubierto y escuchar las objeciones.

Los demás prisioneros no tienen por qué aceptar sus argumentos.

Este conflicto debe representar la dificultad de comunicar el conocimiento a quienes se resisten a abandonar sus creencias.

No hace falta incorporar combate físico ni enemigos con disparos.

## 5. TERCER ACTO: DECISIÓN FINAL

Después del rechazo, Sofía conversa en privado con el prisionero liberado.

**Sofía:**

«Ahora conoces la luz, pero tus compañeros no quieren escucharte. ¿Qué deseas hacer?»

Presentar dos decisiones:

**Opción A: permanecer en la caverna.**

El prisionero decide quedarse e intentar ayudar a los demás.

Sofía reconoce su decisión y comienza sola el segundo ascenso.

El NPC permanece en la caverna con nuevos diálogos disponibles.

**Opción B: regresar al exterior.**

El prisionero decide acompañar nuevamente a Sofía.

Ambos realizan el segundo ascenso y llegan a la superficie luminosa.

Ninguna opción debe considerarse automáticamente incorrecta.

Este desenlace es una adaptación narrativa del videojuego, no una decisión final descrita literalmente por Platón en su alegoría.

## 6. CONCLUSIÓN DE LA AVENTURA

En ambos desenlaces, Sofía debe regresar físicamente por D hasta E y desde allí salir a la superficie circular del planeta de Platón.

Solo después de completar el regreso a la caverna, la decisión del prisionero y el segundo ascenso se registra la misión como concluida.

Entonces se desbloquea el sistema de salida del planeta: nave o portal interestelar ya existente.

**Diferenciar claramente:**
- Salir de una habitación.
- Salir de la caverna.
- Salir del planeta hacia otros mundos.

El jugador puede regresar libremente por puertas ya recorridas, pero no abandonar definitivamente el planeta antes del cierre narrativo.

## 7. SISTEMA DE ESTADOS Y DIÁLOGOS

Configura mediante datos los siguientes estados:

- `sombras_comprendidas`
- `prisionero_liberado`
- `primer_ascenso_completado`
- `regreso_caverna_completado`
- `decision_final_prisionero`
- `segundo_ascenso_completado`
- `aventura_platon_completada`

Las puertas, diálogos y personajes deben reaccionar a estos estados.

Por ejemplo, el prisionero tendrá diferentes conversaciones cuando está encadenado, liberado, en el exterior o de regreso a la caverna.

Guardar el progreso entre habitaciones y al cerrar el juego.

## 8. ILUMINACIÓN DINÁMICA

Reutiliza los fondos existentes.

No generes otra imagen de cada habitación para simular oscuridad.

Implementa:
- Oscuridad configurable por habitación.
- Lámpara que sigue a Sofía.
- Iluminación circular suave.
- Antorchas activables.
- Luz cálida fija del fuego.
- Estados de iluminación persistentes.

En B, la lámpara debe permitir descubrir a los prisioneros sin iluminar toda la habitación simultáneamente.

La oscuridad no debe ocultar completamente los botones táctiles, menús o diálogos.

## 9. PERSONAJES Y REUTILIZACIÓN

Conserva los sprites originales.

Distingue:
- `spriteId`: apariencia.
- `characterId`: identidad.
- `instanceId`: aparición en una habitación.

El prisionero principal debe mantener la misma identidad en B, D y E y durante todo el regreso.

Utilizar sus estados narrativos para cambiar animaciones, diálogos y comportamiento, sin duplicar personajes.

No integrar los NPC en los fondos estáticos.

## 10. VALIDACIÓN OBLIGATORIA

Comprueba que:

1. Sofía camina correctamente sobre el suelo visible.
2. Los fondos no alteran las colisiones.
3. La lámpara y las antorchas funcionan.
4. Todas las habitaciones están conectadas.
5. Las puertas se desbloquean correctamente.
6. Los diálogos ramificados funcionan.
7. El prisionero acompaña a Sofía sin atascarse.
8. Las escaleras permiten completar el recorrido.
9. El regreso a la caverna es obligatorio para cerrar la misión.
10. Las dos decisiones finales producen estados diferentes.
11. La salida del planeta solo se habilita al completar la aventura.
12. Todo funciona con teclado y controles táctiles en horizontal.

**No elimines ni reemplaces el juego existente. Implementa estas funcionalidades de manera incremental y reutilizable.**

## RESULTADO ESPERADO

Una aventura de Platón completamente jugable, basada inicialmente en **exploración y diálogos filosóficos**, con cinco habitaciones conectadas, iluminación dinámica, un prisionero acompañante, un primer ascenso, un regreso obligatorio y un segundo ascenso final.

Deja preparado el sistema para incorporar posteriormente minijuegos, obstáculos adicionales, NPC y nuevas experiencias sin reconstruir las habitaciones.

**Prioridad: jugabilidad, coherencia filosófica, continuidad narrativa, compatibilidad con el proyecto actual y funcionamiento en celular horizontal.**
# PLATÓN · Plan maestro de expansión del planeta y del aprendizaje
**Estado:** PROPUESTA PARA REVISIÓN, 23-11-2026. **No implementada ni aprobada por el autor.** Este documento no sustituye el registro factual de [PLATON.md](PLATON.md) ni modifica la versión jugable [plato.json](../../public/worlds/plato.json).

## 1. Punto de partida verificado en el repositorio
- Motor Phaser 3, TypeScript, Vite; planeta circular y editor radial con interacciones.
- Ya existen **dos accesos jugables desde la superficie**: la caverna (objeto *cave*, aproximadamente 190°) y el templo/ágora (*temple*, aproximadamente 35°). El objeto *door* de la casa (132°) actualmente solo examina la Polis; no es una nueva misión.
- La **caverna** comprende cinco habitaciones A–E; iluminación local, cadenas, investigación de fuego y figuras, compañero, dos ascensos, regreso obligatorio y dos desenlaces narrativos. Hay 8 objetivos y 15 conversaciones/50 nodos en el mundo completo, según la documentación actual.
- El **ágora** existe, pero Platón todavía reutiliza la conversación *arrival*. Los papiros no desarrollan un capítulo independiente.
- Hay coleccionables de pergamino con marca *pergamino_encontrado*, pero **no** un compendio de aprendizajes terminado; los campos *activities*, *concepts* y *memories* de *plato.json* están vacíos.
- El banco de preguntas integrado permite elección/verdadero-falso, parejas, clasificación y decisiones. El [framework externo de Bloom](https://github.com/luchitoflores/framework-preguntas/blob/main/README.md) **todavía no es un core conectado**; la arquitectura prevé un adaptador, sin asumir que todos sus tipos existen.
- **Compatibilidad crítica:** el desbloqueo de la siguiente etapa de Historia está ligado actualmente a *aventura_platon_completada*; se puede viajar desde la superficie sin completar la aventura, según reglas actuales. No cambiarlo silenciosamente. Los borradores de navegador pueden diferir del JSON publicado.

## 2. Decisión de estructura propuesta
**Siete grandes entradas temáticas en la circunferencia**, dos existentes y cinco por convertir desde elementos del paisaje, **más un octavo capítulo avanzado dentro de la Academia**, sin añadir una octava construcción a la superficie. Así se cubren los grandes ejes de Platón sin convertir el pequeño planeta en una colección desordenada de puertas.

1. **La Caverna / De las sombras a la educación** — EXISTE; conservar y ampliar.
2. **La Academia / Preguntar y buscar** — EXISTE como espacio; contenido nuevo.
3. **Pórtico de las Formas / Conocimiento y Bien** — PROPUESTO; vincular artísticamente a los pergaminos/olivar del sector oriental, sin reemplazar coleccionables hasta planificar su migración.
4. **La Polis justa / Justicia, ciudad y formación** — PROPUESTO; convertir la casa y su puerta actual en entrada real después de validar el editor.
5. **Santuario del Alma / Razón, ánimo y deseo** — PROPUESTO; acceso próximo al sector del ánfora (sin borrar el coleccionable).
6. **Jardín del Amor y la Belleza / Eros** — PROPUESTO; sector del olivar occidental.
7. **Observatorio del Cosmos / Orden y explicación** — PROPUESTO; sector rocoso occidental, aprovechando un punto geográfico sin pegar un templo arbitrario.
8. **Archivo de las preguntas difíciles** — CAPÍTULO AVANZADO propuesto dentro de la Academia, no nueva entrada exterior: *Parménides*, *Sofista*, *Político* y *Leyes* como muestras del desarrollo crítico de Platón.

Las posiciones de nuevos accesos son **anclajes de diseño**, no coordenadas aprobadas. Hay que revisar la separación angular, el tamaño de los sprites y el paisaje existente antes de situar puertas; **no mover la caverna ni el templo existentes**.

### Mapa lógico propuesto
~~~
SUPERFICIE CIRCULAR DE PLATÓN
├─ Caverna [existente] ─ A → B ↔ C → D ↔ E; regreso obligatorio a B; segundo ascenso
├─ Academia [existente] ─ Sala de diálogo ─ Mesa de preguntas ─ Archivo crítico [futuro]
├─ Pórtico de las Formas [nuevo] ─ Galería de lo sensible ─ Sala de la línea y el Bien
├─ Polis justa [nuevo] ─ Plaza de ciudadanos ─ Consejo ─ Teatro de imitaciones
├─ Santuario del Alma [nuevo] ─ Patio de decisiones ─ Sala del carro alado
├─ Jardín del Amor [nuevo] ─ Sendero de la belleza ─ Mirador
└─ Observatorio del Cosmos [nuevo] ─ Taller del orden ─ Cúpula del Timeo
~~~
Todas las salidas regresan al objeto y ángulo desde los que entró Sofía. **Sin rediseñar el planeta circular en esta etapa**. Cada entrada empieza con una habitación genérica funcional; subhabitaciones previstas se abren luego.

## 3. Fichas integrales de las entradas

### ENTRADA 1 · La caverna: apariencia, aprendizaje y retorno
**Estado:** implementada con A–E; extensión pedagógica propuesta, sin sustituir su historia.

**Arte exterior:** boca de caverna que ya está ilustrada en el planeta; sombras progresivas hacia el sector inferior, sin representar un corte interno del globo. **Arte interior:** fondos laterales 16:9 ya existentes con plataformas de piedra redondeadas, oscuridad azul-violeta, focos ámbar, suelo físico Y=560 para salas ordinarias, pendientes y escalones explícitos solo en D. Los prisioneros son sprites de identidad independiente; conservar el diseño actual y sus apariciones.

**Secuencia y acciones:** conversación de Platón → A lámpara → B prisioneros/cadenas/muro → C fuego, figuras, origen de proyecciones → B consentimiento y liberación → D subida → E deslumbramiento → regreso físico D→B y rechazo → elección quedarse/subir → segundo ascenso → despedida con Platón → retorno a la superficie. Los estados *sombras_comprendidas*, *prisionero_liberado*, *primer_ascenso_completado*, *regreso_caverna_completado*, *decision_final_prisionero*, *segundo_ascenso_completado* y *aventura_platon_completada* **ya existen**, no duplicarlos.

**Diálogo de ampliación sugerido, tras inspeccionar el muro:**
- Sofía: «¿Qué sabes de esos seres que ves?»
- Prisionero: «Sus sombras nos dicen cómo son».
- Sofía: «¿Has comprobado alguna vez qué las produce?»
- Prisionero: «Nunca nos hemos vuelto hacia el fuego».
- Elecciones: «Investigar la fuente» / «Pedir una razón» / «Afirmar que están equivocados». La última genera resistencia, no pérdida de vida.

**Evidencia de aprendizaje:** distinguir observación, objeto y proyección; argumentar por qué algo familiar puede ser incompleto; explicar la dificultad del regreso. **Actividad futura principal:** *Diagrama con etiquetas* (Bloom 2, **Ahora** en framework; requiere adaptador). Para el regreso, la evaluación por argumentos se hace ya en diálogo; no convertir la elección de permanecer/subir en una respuesta correcta.
**Fragmento del pergamino:** «Las sombras no agotan lo real; aprender exige investigar, revisar y volver a dialogar». **Fuente principal:** *República* VII, 514a–521b. No confundir exterior físico con presencia literal de las Formas.

### ENTRADA 2 · La Academia: diálogo y búsqueda
**Estado:** la escena *agora* existe; requiere diálogo y actividades propias.

**Arte:** mismo templo griego del planeta ya existente; interior luminoso sobrio, suelo lateral plano, bancos, mesa de papiros y un círculo despejado para interlocutores. Platón se encuentra cerca de la mesa; Sócrates puede aparecer como NPC contextual, no un planeta adicional escondido.

**Secuencia:** el estudiante escucha una definición de virtud → Sofía pregunta por casos → el NPC da contraejemplos → revisa su definición → construye una formulación provisional. Abrir una sala opcional sobre la investigación del *Menón* (pregunta por la posibilidad de aprender y teoría de la reminiscencia como tesis discutida, no hecho científico establecido).

**Diálogo:**
- Sofía: «¿Se puede aprender si todavía no sabemos lo que buscamos?»
- Platón: «Esa dificultad aparece en el *Menón*. ¿Qué harías para investigar sin dar por cerrada la pregunta?»
- Sofía elige: «Dar una definición y probarla con casos» / «Memorizar la respuesta» / «Evitar la pregunta».
- Platón: «Probemos tus razones; el diálogo no garantiza una respuesta instantánea».

**Acciones:** hablar, proponer definición, inspeccionar ejemplos en papiros, cuestionar una afirmación y guardar definición revisada. **Evidencia:** el jugador identifica pregunta, supuesto y revisión argumentada. **Actividad:** *Diálogo con opciones* (Bloom 3, **Ahora**; aprovechable con el motor narrativo existente); microactividad de *Tarjetas flash* Bloom 1 opcional, no obligatoria.
**Pergamino:** «Preguntar, contrastar y revisar una definición es parte de filosofar». **Fuentes:** *Menón*, diálogos socráticos y *Teeteto*.

### ENTRADA 3 · Pórtico de las Formas: de la opinión a la razón
**Estado:** nuevo. **Arte exterior:** columna/umbral entre olivos y un pergamino existente; integrar en paisaje, no crear otro planeta ni una galería flotante. **Interior:** galería de objetos observables y sala de la línea dividida, con iluminación clara y signos geométricos; dos niveles didácticos, **sin** afirmar que el mundo inteligible es un piso físico elevado.

**Secuencia:** comparar dos objetos bellos o justos → advertir cambios y diversidad → preguntar por lo común/estable → interpretar imagen de la línea y alegoría del sol → relacionar conocimiento, Formas y Bien.

**Diálogo:**
- Sofía: «Estas cosas son distintas. ¿Cómo podemos decir que ambas son bellas?»
- Platón: «La pregunta no se resuelve solo enumerando lo que agrada a cada uno».
- Sofía: «¿Buscamos una razón que trascienda cada ejemplo?»
- Platón: «Examinemos qué supondría conocer la Belleza o la Justicia misma».

**Acciones:** inspeccionar ejemplos, conversación con Platón, abrir panel de la línea dividida, contrastar una opinión con un argumento. **Evidencia:** no confundir cosa particular con Forma; distinguir niveles de justificación sin reducirlos a mera colección de objetos.
**Actividad:** *Ordenar por grupo* (Bloom 2, **Ahora**; compatible conceptualmente con clasificación ya incluida). Requiere criterios y retroalimentación: NO clasificar arbitrariamente cualquier imagen bonita como «Forma».
**Pergamino:** «No basta con acumular imágenes: conocer exige justificar qué hace común una propiedad». **Fuentes:** *Fedón*, *República* VI–VII.

### ENTRADA 4 · La Polis justa: justicia personal y política
**Estado:** nueva, aprovechando la casa y la puerta de la Polis, sin sobrescribir su interacción actual antes de validar. **Arte:** plaza pequeña con pórtico, consejo, balanza y ciudadanos como sprites genéricos; interiores laterales de suelo uniforme. Una sala secundaria opcional de poesía/imitación (Libro X) para estudiar arte y educación sin caricaturizar a Platón como «enemigo de todo arte».

**Secuencia:** conflicto entre dos ciudadanos → estudiar qué entienden por justicia → deliberar sobre educación, funciones de la ciudad, bienes comunes y riesgo de poder → vincular armonía de la ciudad y del alma → discutir límites de la propuesta platónica desde perspectiva actual.

**Diálogo:**
- Ciudadana: «Si soy la más fuerte, ¿no debería quedarme con lo que deseo?»
- Sofía: «¿Que puedas hacerlo significa que sea justo?»
- Platón: «¿Por qué una ciudad y una persona necesitarían justicia?»
- Sofía: «Quiero escuchar a quienes sufrirían la decisión».

**Acciones:** escuchar tres intereses, inspeccionar consecuencias, deliberar y justificar un voto. **Evidencia:** justificar una decisión, distinguir poder y justicia, reconocer que la propuesta de *República* es debatible.
**Actividad:** *Dilema con consecuencias* (Bloom 3, **Ahora**, soportado parcialmente por el motor de decisiones existente). Como desafío avanzado se reserva *Juicio / Votar y justificar* (Bloom 5, **Ahora**, requiere interfaz y validación).
**Pergamino:** «La justicia exige razones sobre cómo vivir juntos, no solo fuerza o conveniencia». **Fuentes:** *República* I–IV, V, VIII–X; *Leyes* en archivo avanzado.

### ENTRADA 5 · Santuario del Alma: deseo, ánimo y razón
**Estado:** nueva. **Arte:** umbral junto a la zona del ánfora existente; interior con tres espacios simbólicos y una pared que representa el carro alado del *Fedro*, sin hacer físicamente tres «tipos de personas». Iluminación tranquila, bronce y azul.

**Secuencia:** un NPC afronta un conflicto entre deseo inmediato, orgullo y deliberación → Sofía identifica motivaciones → conversa sobre organización del alma en *República* IV → examina el mito del carro alado y los argumentos de inmortalidad del *Fedón* como propuestas filosóficas, no hechos demostrados.

**Diálogo:**
- NPC: «Quiero tomarlo, pero sé que puede perjudicar a mi amigo».
- Sofía: «¿Qué parte de ti desea hacerlo y cuál intenta examinar sus consecuencias?»
- Platón: «No basta con reconocer los impulsos; importa cómo se relacionan».
- Sofía: «Entonces la cuestión es cómo vivir de forma ordenada».

**Acciones:** escuchar motivaciones, seleccionar razones, reconstruir un argumento, conversar sobre sus límites. **Evidencia:** distinguir razón, parte irascible/ánimo y apetito, analizar una premisa sin confundir metáfora con fisiología.
**Actividad:** *Encuentra la premisa que falta* (Bloom 4, **Ahora** del framework; requiere nuevo adaptador).
**Pergamino:** «Una vida justa requiere examinar deseos, ánimo y razones». **Fuentes:** *República* IV, *Fedro*, *Fedón*. El mito de Er puede aparecer como lectura complementaria sobre elección y responsabilidad, no como prueba empírica del más allá.

### ENTRADA 6 · Jardín del Amor y la Belleza
**Estado:** nueva. **Arte:** olivar occidental existente; sendero lateral que va de encuentros cotidianos a un mirador, flores cálidas, pórtico pequeño, sin multiplicar edificios. NPC puede representar interlocutor del banquete, con explicación de Diotima **dentro de una recreación explícita**.

**Secuencia:** Sofía pregunta qué es amar algo bello → se confronta con ejemplos de belleza física, carácter, prácticas, conocimiento → interpreta la llamada escala de Diotima, evitando reducirla a «dejar de amar a las personas».

**Diálogo:**
- Sofía: «¿Amar es simplemente encontrar bello a alguien?»
- Interlocutora: «¿Y si también admiras su modo de actuar y de aprender?»
- Sofía: «Tal vez el deseo puede llevarnos a pensar qué es la belleza».
- Interlocutora: «Examínalo, sin despreciar a las personas concretas».

**Acciones:** conversar, inspeccionar ejemplos, comparar formas de valorar, reconstruir un itinerario de comprensión.
**Actividad:** *Reordenar / Ordenar palabras* (Bloom 2, **Ahora**); idealmente ordenar secuencias con justificación, no una cadena rígida de moralización.
**Pergamino:** «La belleza puede motivar una búsqueda de comprensión y transformación». **Fuentes:** *Banquete* 210a–212a y *Fedro*.

### ENTRADA 7 · Observatorio del Cosmos: orden y explicación
**Estado:** nuevo. **Arte:** punto rocoso occidental del planeta, observatorio reducido integrado con el perfil del terreno; interior lateral con esfera celeste/maquetas como recursos independientes, geometría plana, sin física 3D. No usar imágenes astronómicas modernas como si fueran demostraciones de Platón.

**Secuencia:** Sofía descubre orden y movimiento en el firmamento → el interlocutor presenta el *Timeo* como relato cosmológico → compara modelo inteligible, demiurgo/artífice y universo ordenado → distingue explicación filosófica antigua de ciencia actual → el jugador propone un modelo y justifica sus reglas.

**Diálogo:**
- Sofía: «¿Por qué el cosmos parece tener cierto orden?»
- Timeo (interlocutor): «Probemos un relato razonado sobre el orden de lo que cambia».
- Sofía: «¿Es lo mismo que una explicación científica actual?»
- Timeo: «No. Debemos distinguir las preguntas, los supuestos y las pruebas de cada época».

**Acciones:** inspeccionar cuerpos y relaciones, elegir supuestos, construir una explicación, confrontar consecuencias.
**Actividad:** *Crear tu planeta / Manifiesto* (Bloom 6, **Ahora**, del framework; requiere interfaz y adaptador todavía no integrados). No presentar el demiurgo como creación de la nada.
**Pergamino:** «Una explicación del orden debe declarar su modelo y sus supuestos». **Fuente:** *Timeo*.

### ANEXO AVANZADO EN LA ACADEMIA · Archivo de las preguntas difíciles
**Estado:** propuesto como puerta interior opcional, no octava entrada sobre la superficie. **Arte:** archivo en penumbra con pergaminos, columnas y mesas, escenario lateral reutilizable.

**Secuencia:** Platón invita a cuestionar una formulación simplificada de las Formas → un interlocutor introduce dificultades del *Parménides* y problemas de clasificación del *Sofista*/*Político* → comparar tensiones entre *República* y *Leyes* sin afirmar que todo Platón sea un sistema sin contradicciones.

**Diálogo:** Sofía: «¿Y si una idea que parecía sólida encuentra un contraejemplo?» / Platón: «Entonces no terminamos de filosofar; debemos examinar mejor sus supuestos».
**Actividad:** *Identifica la falacia* (Bloom 4, **Ahora**), solo cuando el argumento presentado tenga realmente una falacia identificable; en otros casos, discusión mediante diálogo y contraejemplo.
**Sello adicional:** «La filosofía también somete sus propias teorías a examen». **Fuentes:** *Parménides*, *Sofista*, *Político*, *Leyes*. No obliga a completar de nuevo la Caverna.

## 4. Mapa Bloom: un tipo principal diferente por entrada

| Entrada | Núcleo de aprendizaje | Tipo exacto en framework | Bloom | Disponible en juego actual |
|---|---|---|---|---|
| 1 Caverna | Interpretar luz, objeto y sombra | **Diagrama con etiquetas** | 2 Comprender | No: historia por diálogo ya funciona |
| 2 Academia | Practicar investigación mediante preguntas | **Diálogo con opciones** | 3 Aplicar | Sí, como diálogo narrativo |
| 3 Formas | Diferenciar casos y clases justificadas | **Ordenar por grupo** | 2 Comprender | Sí, clasificación configurable |
| 4 Polis justa | Examinar resultados de políticas | **Dilema con consecuencias** | 3 Aplicar | Sí, decisiones configurables |
| 5 Alma | Identificar estructura de un argumento | **Encuentra la premisa que falta** | 4 Analizar | Pendiente de adaptador |
| 6 Eros | Reconstruir argumentativamente un itinerario | **Reordenar / Ordenar palabras** | 2 Comprender | Pendiente de adaptador |
| 7 Cosmos | Crear y explicar un modelo de orden | **Crear tu planeta / Manifiesto** | 6 Crear | Pendiente de adaptador |
| Anexo crítico | Contrastar y detectar razonamientos inválidos | **Identifica la falacia** | 4 Analizar | Pendiente de adaptador |

**Bloom 1 (Recordar):** tarjetas flash o completar la frase opcionales en la Academia para vocabulario; no reducir la filosofía a memorizar. **Bloom 5 (Evaluar):** introducir *Juicio / Votar y justificar* como desafío de profundización al regresar a los prisioneros o en la Polis, con evidencia escrita y sin calificar por acuerdo ideológico. La **demanda cognitiva depende de la consigna y de la justificación**, no exclusivamente del nombre del minijuego.

El README del framework dice «18 minijuegos Ahora», pero sus listas enumeran **28 entradas bajo «Ahora»** (6+6+7+4+4+1): revisar ese total editorial con el autor; **no alterar sus prioridades, juegos ni taxonomía**.

## 5. El gran pergamino de Platón: colección de aprendizajes

**Diseño propuesto:** un único **Pergamino de Platón**, con **siete folios temáticos** y **un sello avanzado optativo**. Los fragmentos se van incorporando conforme Sofía presenta una evidencia de comprensión; **no** se inventa un pergamino independiente nuevo por cada minijuego. Se conserva *pergamino_encontrado* como coleccionable heredado, sin usarlo por sí solo como prueba de maestría.

Cada folio contiene:
- Título e ilustración simbólica.
- **Idea esencial** expresada con rigor en lenguaje de bachillerato.
- Dos a cuatro conceptos clave con definiciones recuperables.
- **«Cómo lo descubrí»**: acción, diálogo y evidencia de razonamiento del jugador.
- Pregunta final de transferencia a la vida actual, editable y sin atribuir a Platón una respuesta moderna.
- Obra/pasaje de referencia y sello **descubierto / comprendido / profundizado**.
- Acceso a rejugar el escenario sin borrar el progreso de otros folios.

**Secuencia de folios:** Sombras y educación; Preguntas e investigación; Formas y Bien; Justicia y ciudad; Alma y decisiones; Amor y belleza; Cosmos y orden. El sello de «Pensamiento crítico» se abre en el archivo avanzado. Un resumen final reúne conexiones entre conceptos y deja ver un recorrido de los siete aprendizajes.

**Cierre narrativo del pergamino:** Platón felicita a Sofía por **justificar y revisar lo que cree**, no por repetir su doctrina; Sofía recibe la colección ilustrada. La ruta Historia vigente sigue desbloqueando el siguiente planeta con *aventura_platon_completada*. La colección completa tendrá su **marca nueva de maestría**, independiente del desbloqueo existente, y podrá completarse en revisitas. No borrar guardados, ni exigir de repente siete capítulos a quien ya pasó de Platón a Kant.

## 6. Contrato de documento para cada nuevo mundo

Cada documento en *docs/mundos/* debe contener, como mínimo y de forma autónoma:
1. **Estado verificado** con enlaces al JSON ejecutable y distinción implementado/propuesto/aprobado pendiente.
2. Problema central, teoría, obras y **objetivos medibles** para el jugador.
3. **Geografía global** del planeta circular y mapa de accesos, posicionamiento y conexiones bidireccionales; no atribuir coherencia filosófica a decorados arbitrarios.
4. **Ficha gráfica por entrada**: perspectiva lateral, estilo semi-3D cartoon, referencia de imagen, dimensiones, suelo/obstáculos y NPC como sprites; móvil landscape, lógica 1280×720, fondo nominal 1920×1080, suelo principal Y=560, excepciones explícitas.
5. **Fichas de aprendizaje por escena**: motivación, acción del jugador, diálogo completo y ramificaciones, información descubierta, feedback y transferencia.
6. **Minijuego** con nombre exacto del framework, Bloom, consigna, ejemplo de respuestas, validación, retroalimentación y condición de desbloqueo; si no está implementado, indicarlo.
7. Identidades de personajes y estados compartidos/por aparición; puertas, retornos, guardado y fallos recuperables.
8. **Colección del pergamino** con folios, evidencias y entrega final, sin romper el progreso actual.
9. Orden de implementación, pruebas de compatibilidad, fuentes filosóficas y licencias narrativas.

## 7. Orden recomendado y reglas de integración
**Fase A, sin cambiar el motor:** validar la caverna ya terminada, escribir el contenido propio del ágora y preparar fichas/artes de siete accesos sobre el terreno existente. Actualizar el pergamino **como diseño**.
**Fase B, con actividades nativas:** poner Academia, Formas y Polis en funcionamiento con diálogos, clasificación y decisiones ya disponibles.
**Fase C, con adaptador del framework:** incorporar una a una actividades de premisa, ordenar, diagramas, creación, juicio; el framework devuelve resultados, el motor de Sofía registra flags, desbloqueos, folios y guardado. Sin duplicar cada minijuego para Platón.
**Fase D, enriquecimiento:** arte final, nuevos interiores, sello crítico avanzado y revisitas, comprobando móvil real.

No tocar el archivo principal ni la caverna para simular que los capítulos están implementados. **No generar nuevos assets hasta revisar colisiones, espacio angular, rutas y arte existente**. Verificar todos los cambios por pruebas de datos y el recorrido de puertas en pantalla; el repositorio reporta pruebas con Chrome emulado, no certificación en móvil físico.

## 8. Fuentes y documentación
- Estado actual: [PLATON.md](PLATON.md), [plato.json](../../public/worlds/plato.json), [CAVERNA-JUGABLE.md](../CAVERNA-JUGABLE.md), [MOTOR-Y-RUTAS.md](../MOTOR-Y-RUTAS.md), [EVOLUCION-MODULAR.md](../EVOLUCION-MODULAR.md).
- Taxonomía y tipos aprobados: [framework-preguntas README](https://github.com/luchitoflores/framework-preguntas/blob/main/README.md). **No modificar clasificaciones ni prioridades.**
- Fuente filosófica: [Stanford Encyclopedia of Philosophy, Plato](https://plato.stanford.edu/entries/plato/), [Ética platónica](https://plato.stanford.edu/entries/plato-ethics/), [Ética y política en República](https://plato.stanford.edu/entries/plato-ethics-politics/), [Metafísica y epistemología](https://plato.stanford.edu/entries/plato-metaphysics/), [Timeo](https://plato.stanford.edu/entries/plato-timaeus/), [Parménides](https://plato.stanford.edu/entries/plato-parmenides/), [Sofista y Político](https://plato.stanford.edu/entries/plato-sophstate/).
- **Distinguir siempre** pasajes de Platón, paráfrasis pedagógicas y libertad narrativa del juego. El jugador no debe recibir una respuesta «incorrecta» por la elección moral de un personaje.

---
**ESTO ES UN PLAN DE EXPANSIÓN PARA DISCUSIÓN, NO CÓDIGO NI CONFIRMACIÓN DE IMPLEMENTACIÓN.**
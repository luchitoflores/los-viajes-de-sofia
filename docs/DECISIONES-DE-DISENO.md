# ACTUALIZACIÓN DE DECISIONES DE DISEÑO
## PROYECTO: SOFÍA Y LOS MUNDOS DE LAS IDEAS

Actúa como director de desarrollo, arquitecto de software, diseñador de videojuegos 2D y especialista en didáctica de la filosofía.

Este documento establece las **decisiones de diseño que hemos tomado para el videojuego**. Debes incorporarlas a la arquitectura del proyecto y utilizarlas como referencia obligatoria para las próximas implementaciones.

No se trata de desarrollar un videojuego distinto por cada filósofo, sino de construir **un motor común que permita crear decenas de mundos filosóficos reutilizando código, herramientas y mecánicas**.

## 1. ORGANIZACIÓN DEL UNIVERSO

El videojuego presenta a Sofía, una pequeña astronauta que viaja por el Universo de las Ideas.

La organización será:

- **Universo:** contiene todas las galaxias filosóficas.
- **Galaxias:** representan las grandes épocas históricas: antigua, medieval, moderna y contemporánea.
- **Sistemas solares:** representan escuelas o corrientes filosóficas: racionalismo, empirismo, idealismo, existencialismo, fenomenología, pragmatismo, etc.
- **Planetas:** cada planeta pertenece a un filósofo individual.
- **Regiones e interiores:** representan aspectos de su pensamiento, teorías, obras y problemas filosóficos.

La filosofía latinoamericana tendrá una navegación temática destacada, sin confundir una clasificación geográfica con una época histórica.

Un filósofo puede relacionarse con varias corrientes, pero **solo debe tener un planeta**, conectado desde diferentes rutas del atlas.

## 2. MECÁNICA PRINCIPAL: PLANETAS CIRCULARES 2D

Cada mundo será un pequeño planeta redondo, inspirado en la apariencia de los planetas de Angry Birds Space y los pequeños mundos de los cuentos ilustrados.

Sofía podrá recorrer caminando los **360 grados de la circunferencia**.

El planeta es un escenario jugable, no una imagen decorativa ni un menú de selección.

Durante la exploración encontrará:

- Objetos examinables e interactivos.
- Personajes secundarios o NPC.
- Al filósofo titular del planeta.
- Caminos, árboles, construcciones y accidentes geográficos.
- Entradas a escenarios interiores.
- Pistas, secretos y actividades desbloqueables.

La física radial, el movimiento, la cámara y los controles serán compartidos por todos los planetas.

**No programar leyes físicas completamente distintas para cada filósofo en esta primera etapa.** Las diferencias conceptuales deben manifestarse principalmente mediante escenarios, historias, objetos y minijuegos.

## 3. ENCUENTRO INICIAL OBLIGATORIO CON EL FILÓSOFO

En la primera visita a cada planeta, Sofía deberá conocer a su filósofo titular antes de comenzar la exploración libre.

El filósofo se presentará, introducirá el problema fundamental de su pensamiento y propondrá una pequeña interacción inicial.

Este encuentro será breve, interesante y pedagógico, no una conferencia llena de explicaciones.

Posteriormente, Sofía podrá volver a conversar con él para consultar conceptos, conocer nuevas ideas o iniciar actividades adicionales.

Los diálogos iniciales deben introducir el pensamiento del autor de forma progresiva.

## 4. DISEÑO GEOGRÁFICO COMPLETO DESDE EL PRINCIPIO

**Antes de generar la ilustración definitiva de cualquier planeta, debemos estudiar suficientemente la filosofía de su autor.**

Identificar:

1. Su problema filosófico central.
2. Las principales teorías y conceptos.
3. Sus obras fundamentales.
4. Los ejemplos y argumentos que utiliza.
5. Las experiencias jugables que podemos construir a partir de su pensamiento.
6. Los escenarios interiores que necesitaremos ahora y en futuras ampliaciones.

Con esa información diseñaremos toda la geografía exterior.

Un planeta no debe convertirse en una acumulación arbitraria de edificios, objetos o iconos.

Sus montañas, ríos, construcciones, caminos y objetos deben formar un paisaje integrado, visualmente coherente y relacionado con los contenidos filosóficos.

**La geografía exterior se planificará para todas sus ampliaciones futuras, aunque inicialmente solo estén disponibles una o dos experiencias jugables.**

No será necesario rediseñar todo el planeta cada vez que agreguemos una nueva teoría.

## 5. CREACIÓN DE ESCENARIOS Y PERSONAJES CON IA DE IMÁGENES

No queremos gastar créditos de programación generando visualmente los planetas mediante código.

Utilizaremos herramientas de generación de imágenes para crear:

- Ilustración base del planeta circular.
- Fondos de escenarios interiores.
- Personajes y sprites.
- Objetos interactivos.
- Puertas, mecanismos y elementos animables.
- Recursos decorativos y ambientales.

Los recursos interactivos deben estar separados de la ilustración principal para poder moverlos, escalarlos, animarlos y asignarles comportamientos.

Se utilizará una estética 2D ilustrada, tipo cuento, coherente entre todos los recursos del mundo.

No usar emojis, formas geométricas primitivas ni objetos que parezcan pegados sobre un fondo como sustitutos del arte final.

## 6. CREAR UN EDITOR VISUAL REUTILIZABLE

Esta es una prioridad del proyecto.

Necesitamos desarrollar **un editor de planetas dentro del propio videojuego**, accesible desde navegador y adaptado a pantallas táctiles.

El editor debe permitir:

- Importar una ilustración circular.
- Incorporar sprites independientes.
- Arrastrar objetos hasta la superficie.
- Ajustar automáticamente su orientación sobre el planeta.
- Modificar tamaño, ángulo y posición.
- Colocar NPC y filósofos.
- Crear objetos examinables y coleccionables.
- Configurar interacciones.
- Crear puertas y vincularlas a interiores.
- Asignar minijuegos y diálogos.
- Probar el escenario inmediatamente.
- Guardar, exportar e importar configuraciones JSON.

El editor no necesita dibujar artísticamente el planeta: esa función corresponde a las herramientas gráficas.

Su responsabilidad es **componer y configurar mundos jugables sin modificar código manualmente**.

## 7. ESCENARIOS INTERIORES 2D

Algunos objetos de la superficie permitirán entrar a escenas interiores.

Por ejemplo: una puerta, una caverna, una biblioteca, un templo, una fábrica, un ascensor o una entrada entre raíces.

Al activarlos, Sofía accederá a un escenario lateral 2D tradicional.

Allí encontrará objetos, personajes, diálogos, acertijos y minijuegos.

Cada interior tendrá puertas funcionales de salida.

Al salir, Sofía regresará al mismo planeta circular, cerca de la entrada correspondiente, conservando su progreso.

Esta mecánica debe programarse **una sola vez y funcionar para todos los planetas**.

## 8. BIBLIOTECA UNIVERSAL DE MINIJUEGOS

Desarrollaremos una colección de minijuegos reutilizables y configurables mediante datos.

Mecánicas previstas:

1. **Diálogos ramificados:** conversar, preguntar, investigar y tomar decisiones.
2. **Relacionar parejas:** unir términos, ideas, ejemplos, imágenes y conceptos.
3. **Clasificar:** arrastrar elementos a categorías.
4. **Decisiones con consecuencias:** analizar situaciones y observar resultados.
5. **Ordenar:** organizar conceptos, argumentos o secuencias.
6. **Asteroides:** Sofía utiliza su nave para saltar entre asteroides con respuestas o desafíos.
7. **Pasapalabra filosófico:** rosco de definiciones y conceptos.
8. **Puzles:** reconstruir imágenes, escenarios, argumentos o mecanismos.
9. **Acción opcional:** disparos, evasión de obstáculos u otras acciones, solo cuando tengan sentido en la experiencia.

**Prioridad inicial de programación:**

- Sistema universal de diálogos.
- Relacionar parejas.
- Clasificación.
- Decisiones con consecuencias.

Los demás minijuegos se incorporarán progresivamente.

Cada minijuego debe poder reutilizarse cambiando su configuración, recursos gráficos, contenidos, reglas y recompensas.

Evitar programar una versión distinta del mismo minijuego para cada filósofo.

## 9. SISTEMA UNIVERSAL DE INTERACCIONES

Los objetos tendrán comportamientos reutilizables:

- Examinar.
- Hablar.
- Recoger.
- Activar.
- Abrir.
- Iniciar minijuego.
- Desbloquear contenido.
- Entrar a un interior.
- Mostrar un concepto o recuerdo.

Cada objeto tendrá identificador permanente, posición y configuración de interacción.

Esto permitirá ampliar su comportamiento posteriormente sin reescribir toda la escena.

Por ejemplo, un árbol puede ofrecer inicialmente una observación y más adelante permitir entrar a una cueva entre sus raíces.

## 10. CRECIMIENTO PROGRESIVO DE LOS PLANETAS

Cada mundo debe diseñarse para abarcar el pensamiento completo de su filósofo.

Sin embargo, no construiremos todas las experiencias jugables al mismo tiempo.

La primera versión de cada planeta tendrá:

- Superficie circular completa.
- Geografía exterior coherente con sus futuras expansiones.
- Encuentro inicial con el filósofo.
- Objetos interactivos básicos.
- Una o dos experiencias jugables completas.
- Puertas funcionales cuando corresponda.
- Primeros conceptos y logros desbloqueables.

Las versiones posteriores ampliarán los objetos existentes y abrirán nuevos interiores.

Los datos, posiciones e identificadores deberán permitir incorporar contenido sin perder el progreso de los jugadores.

## 11. PRIMER MUNDO DE REFERENCIA: JEAN-PAUL SARTRE

El planeta de Sartre debe diseñarse a partir de una visión amplia de su filosofía, no únicamente de la libertad de elección.

Su geografía exterior incluirá de forma integrada:

- Una montaña y un mirador.
- Una colina con café y anfiteatro.
- Caminos que se bifurcan.
- Un río con puente.
- Un valle comunitario.
- Un bosque con árboles de raíces prominentes.

Estos elementos no son seis minijuegos aislados, sino partes de un mismo paisaje.

El mundo tiene previstos contenidos sobre fenomenología, conciencia, existencia y esencia, libertad, facticidad, proyecto, mala fe, ser-en-sí, ser-para-sí, la nada, mirada del Otro, ética, literatura, historia y compromiso social y político.

**Encuentro inicial:**

Sofía aterriza y conoce a Sartre.

El filósofo le presenta un cortapapeles, inspirado en el ejemplo de *El existencialismo es un humanismo*, para introducir la diferencia entre un objeto fabricado conforme a una finalidad previamente concebida y la existencia humana.

Esta interacción introduce el problema de existencia y esencia.

**Primera experiencia jugable: Café de las Máscaras.**

Tema: mala fe, roles sociales y libertad situada.

Mecánicas: diálogos, investigación de objetos y clasificación de evidencias.

**Segunda experiencia jugable: Sala de los Dos Caminos.**

Tema: elección, angustia, libertad situada y responsabilidad.

Mecánica: decisiones con consecuencias y argumentación.

Utilizar preferentemente el ejemplo sartreano del joven que debe elegir entre cuidar a su madre o unirse a las fuerzas de la Francia Libre.

El río, el puente, el valle y las demás regiones existirán en la geografía exterior, pero sus experiencias más extensas se desarrollarán después.

**Rigor filosófico:**

- Sísifo pertenece a la mitología y es central para una obra de Camus: reservar su experiencia principal para el planeta de Camus.
- El dilema del tranvía corresponde a la tradición ética asociada a Philippa Foot y Judith Jarvis Thomson; no atribuirlo a Sartre.
- Caronte es una figura mitológica, no una teoría sartreana.
- No elegir un objeto como protagonista únicamente porque lo mencioné durante una conversación.

Las decisiones artísticas y pedagógicas deben partir de la filosofía documentada, no de asociaciones visuales arbitrarias.

## 12. PRIORIDAD DE DESARROLLO Y AHORRO DE CRÉDITOS

La arquitectura tecnológica objetivo es **Phaser 3 + TypeScript + Vite**.

Priorizar el desarrollo de componentes genéricos:

1. Motor de planetas circulares.
2. Editor visual de mundos.
3. Sistema de interacciones y NPC.
4. Sistema de puertas e interiores.
5. Motor de diálogos.
6. Minijuegos reutilizables.
7. Guardado y progresión.
8. Carga de mundos desde archivos de datos.

No escribir código específico para dibujar cada planeta ni programar individualmente sus puertas, personajes o minijuegos.

Si una función ya existe, reutilizarla.

Si una nueva solicitud puede resolverse modificando un JSON o incorporando un recurso gráfico, no modificar el código del motor.

Evitar refactorizaciones innecesarias, reconstrucciones completas y funcionalidades que todavía no forman parte del alcance.

No confundir funcionalidades planificadas con funcionalidades implementadas o probadas.

## 13. INSTRUCCIÓN PARA EL TRABAJO ACTUAL

Antes de desarrollar nuevos planetas, revisa el proyecto existente y determina qué componentes del motor común ya funcionan y cuáles faltan.

No elimines funcionalidades existentes que puedan aprovecharse.

Prepara una arquitectura modular que permita crear mundos con imágenes, sprites y configuraciones, sin necesidad de reprogramar cada planeta.

Utiliza el mundo de Sartre como caso de referencia para validar el sistema completo.

**No empieces programando el puente, el café o un minijuego aislado sin comprobar que existe el mecanismo genérico que permitirá reutilizarlo en todos los mundos.**

Respeta las decisiones anteriores, identifica contradicciones y señala cualquier propuesta que sea filosóficamente incorrecta o técnicamente ineficiente.

### PRINCIPIO RECTOR

**Un motor, infinitos mundos ampliables.**

La IA de imágenes crea el arte.

El editor visual compone los escenarios y configura las interacciones.

El motor Phaser ejecuta el movimiento, los diálogos, los interiores y los minijuegos.

La filosofía determina qué representa cada planeta, cómo se organiza su geografía y qué aprende el estudiante.

Nuestro objetivo es invertir los créditos de programación principalmente en herramientas reutilizables, no en construir repetidamente los mismos sistemas para cada filósofo.
## Corrección posterior del autor — 21 de noviembre de 2026
El universo vuelve a mostrar los cuatro mundos ilustrados con entrada directa, conservando el atlas histórico como navegación complementaria. El prisionero solo acompaña durante el rescate hasta la salida de la caverna; allí termina su episodio. El guía que acompaña la exploración es el filósofo del escenario. Sofía y los filósofos usan una referencia común de altura visible: 118 unidades. Esta corrección sustituye cualquier indicación anterior de seguimiento global del prisionero. Las partidas existentes conservan sus descubrimientos y liberación.

## Decisión posterior: encuentros y editor
El autor cambia el acompañamiento del filósofo por encuentros clave de diálogo y retroalimentación en lugares reconocibles. El prisionero conserva su recorrido limitado al rescate. La edición visual crea mundos e interiores, conecta puertas y reutiliza recursos; JSON conserva el formato común de importación/exportación y el contenido avanzado. Retroceder entre interiores debe volver a la escena anterior, cerca de la puerta de origen, sin salir a la superficie prematuramente. Esta decisión sustituye la indicación anterior de seguimiento permanente del filósofo.

## Prioridad actual: generación y jugabilidad

La solicitud completa se conserva en [ACTUALIZACION-MOTOR-GENERADOR.md](ACTUALIZACION-MOTOR-GENERADOR.md). Mantener Platón y Sartre y añadir Camus, Hegel, Kant y Heidegger mediante plantillas y datos. Se autorizan recursos existentes provisionales y sprites independientes para estos prototipos; no generar arte definitivo ni minijuegos complejos ahora. Una imagen principal por interior nuevo, resolución 1280×720, suelo Y=560 y geometría separada. Conservar las coordenadas y partidas de las escenas antiguas.

Separar identidad, apariencia e instancia; favorecer encuentros fijos, diálogos ramificados, conexiones validadas y creación por lotes. La interpretación natural de conexiones es acotada y documentada. La referencia visible de los personajes se escala proporcionalmente desde 118/540 del encuadre, manteniendo sus pies apoyados.

## Modos y encuentros elegidos por el jugador

Sofía utiliza una sola nave. Su apariencia puede configurarse con los recursos del mundo y el vuelo conserva la apariencia con la que se embarcó; los objetos de nave son puntos de estacionamiento, no vehículos adicionales.

El modo Historia sigue una ruta editable por datos: Platón → Kant → Hegel → Heidegger → Sartre → Camus. Completar los objetivos de una etapa abre la siguiente y permite revisitar las anteriores. Libre permite cualquier destino. Cada modo tiene una partida independiente, automática y manual, en el mismo navegador; el progreso anterior se conserva en Libre. Borradores y recursos del editor se comparten.

La llegada queda libre de diálogos automáticos. Sofía desembarca cerca del anfitrión y el jugador elige conversar mediante clic, toque o E/Enter al estar cerca. La presentación sigue siendo necesaria para las actividades, pero no bloquea caminar ni abre una conversación por pasar junto al filósofo. Los dos interlocutores se miran durante el diálogo. Esta decisión posterior sustituye la presentación automática descrita antes.

## Historia: mapa antes del aterrizaje

Al empezar, reanudar o reiniciar Historia aparece primero el mapa. El jugador selecciona un planeta sin candado y observa a Sofía en su nave, el descenso y el desembarque antes de explorar. La superficie precargada permanece oculta durante esa selección. Esta llegada reutiliza el viaje común y conserva una sola nave. Las decisiones y descubrimientos se guardan; la entrada desde el mapa vuelve a la superficie por aterrizaje. Libre mantiene su continuación en la posición guardada.


## Continuidad, edición y colecciones — 24 de noviembre de 2026

- Colección de autores global por partida: retratos de conocidos, incógnitas de pendientes y fichas de vida, obras y pensamiento.
- Un pergamino por tema/mundo con apartados desbloqueados por misión; recuperar premios de partidas anteriores sin reiniciar.
- Linterna inicialmente apagada y disponible por escenas, de momento solo caverna. Conservar decisiones explícitas guardadas.
- Llegadas y compañero orientados según entrada; vuelos de ida y vuelta según orden de planetas.
- Suelo físico y anclaje de imagen independientes; 560 es valor inicial, no límite inferior obligatorio.
- Salto opcional en interiores mediante teclado o gesto; no en superficies radiales.
- Portal azul de salida habilitado al completar la aventura; conserva regreso por puertas anteriores.
- Cerrar edición sin cambios vuelve sin recargar; con cambios permite guardar, descartar o cancelar.

Implementación y pruebas: [COLECCIONES-Y-CONTINUIDAD.md](COLECCIONES-Y-CONTINUIDAD.md).

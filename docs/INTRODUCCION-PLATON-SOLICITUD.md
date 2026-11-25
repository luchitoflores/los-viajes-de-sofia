# Solicitud del autor y corrección vigente

Corrección posterior del autor: **la linterna está en el escenario 1 del mito de la caverna**, no en la superficie. El primer recinto permite buscarla y regresar a Platón; la autorización y el encendido habilitan avanzar al escenario 2.

---

# IMPLEMENTACIÓN: INTRODUCCIÓN AL PLANETA DE PLATÓN Y MECÁNICA DE BÚSQUEDA DE OBJETOS

Trabaja sobre el proyecto existente **«Sofía y los mundos de las ideas»**, respetando su arquitectura, diseño visual, personajes, escenarios, controles y mecánicas previamente implementadas.

El objetivo es desarrollar el inicio de la aventura en el planeta de Platón e introducir, de manera natural y narrativa, una nueva mecánica de exploración, búsqueda, recolección y utilización de objetos que posteriormente pueda reutilizarse en todos los mundos del videojuego.

## 1. Llegada de Sofía al planeta

Cuando Sofía llegue al planeta de Platón:

- Presentar brevemente el mundo mediante una transición visual.
- Permitir que el jugador tome el control de Sofía.
- Incentivar la exploración del escenario.
- Situar a Platón en las proximidades de la entrada de la caverna.
- Incorporar una indicación visual discreta que permita identificar que es posible conversar con Platón.

No presentar inicialmente un tutorial extenso ni grandes bloques de texto. El jugador debe descubrir las mecánicas mediante la propia aventura.

## 2. Primer encuentro con Platón

Cuando Sofía se acerque a Platón, debe poder interactuar con él e iniciar una conversación.

Utilizar diálogos breves, naturales y relacionados con el pensamiento filosófico de Platón.

**Platón:** ¡Bienvenida, viajera! Pocas personas se atreven a explorar este lugar.

**Sofía:** ¡Hola! ¿Qué hay dentro de esa caverna?

**Platón:** En su interior encontrarás personas que creen conocer la realidad, aunque jamás han contemplado el verdadero mundo.

**Sofía:** ¡Quiero entrar y descubrirlo!

**Platón:** No tan deprisa. El interior es demasiado oscuro. Necesitarás algo que ilumine tu camino.

**Sofía:** ¿Dónde puedo encontrarlo?

**Platón:** En algún lugar de este mundo hay una linterna. Explora los alrededores y encuéntrala. A veces, para descubrir la verdad, primero debemos aprender a buscar.

Al finalizar el diálogo, activar automáticamente la primera misión.

## 3. Primera misión: encuentra la linterna

**Nombre de la misión:** Una luz en la oscuridad.

**Objetivo:** Encontrar una linterna que permita explorar la caverna.

Mostrar discretamente en la interfaz:

- Misión activa.
- Objetivo actual.
- Estado de la misión.
- Icono de la linterna, inicialmente sin descubrir o en silueta.

La linterna debe encontrarse físicamente integrada dentro del escenario, en un lugar accesible mediante las mecánicas de movimiento existentes.

No colocarla directamente junto a Platón ni señalar permanentemente su ubicación. El jugador debe tener una razón para recorrer y explorar el planeta.

La búsqueda debe ser sencilla, puesto que constituye la primera experiencia del jugador con esta mecánica.

## 4. Mecánica de búsqueda y recolección

Implementar un sistema general de objetos interactivos y coleccionables dentro de los escenarios.

Cuando Sofía se aproxime a un objeto:

- Mostrar una indicación contextual de interacción.
- Permitir recogerlo mediante los controles disponibles, tanto en dispositivos móviles como en ordenadores.
- Reproducir una pequeña animación de recolección.
- Incorporar un efecto sonoro.
- Añadir el objeto al inventario.
- Actualizar automáticamente el progreso de la misión.

Al recoger la linterna, mostrar una notificación breve:

**¡Objeto encontrado!**

Linterna — Permite iluminar lugares oscuros.

El objeto debe desaparecer de su posición original una vez recogido y su estado debe conservarse al cambiar de escenario o guardar la partida.

## 5. Inventario de objetos

Implementar o ampliar el inventario existente para almacenar objetos que tengan una función dentro de la aventura.

Cada objeto deberá disponer de:

- Identificador único.
- Nombre.
- Imagen o sprite.
- Descripción.
- Categoría.
- Estado de descubrimiento.
- Funcionalidad.
- Condiciones de utilización.
- Relación opcional con misiones.
- Posibilidad de equiparse, utilizarse o entregarse.

La linterna será el primer objeto funcional de la aventura, pero el sistema debe admitir posteriormente llaves, herramientas, libros, pergaminos, mapas, artefactos y otros elementos.

No confundir este inventario con el álbum de filósofos, conceptos filosóficos o recompensas coleccionables.

## 6. Regreso a la caverna

Una vez encontrada la linterna, actualizar la misión:

**Nuevo objetivo: regresa a la entrada de la caverna.**

Cuando Sofía regrese y converse nuevamente con Platón, activar un diálogo diferente.

**Platón:** Veo que has encontrado la linterna.

**Sofía:** ¡Sí! Ahora podremos ver lo que hay dentro.

**Platón:** Recuerda, Sofía: la luz puede ayudarte a ver, pero comprender lo que ves requerirá algo más.

**Sofía:** ¿Qué cosa?

**Platón:** Tu capacidad de pensar y cuestionar lo que parece evidente. Adelante, entra y descubre por ti misma.

Después de esta conversación, permitir el acceso a la caverna.

## 7. Bloqueo y desbloqueo de zonas

La linterna debe ser realmente necesaria para avanzar.

Si el jugador intenta ingresar a la caverna antes de conseguirla, impedir el acceso mediante una condición de juego y mostrar un mensaje contextual:

**Está demasiado oscuro. Necesitas encontrar algo que ilumine el camino.**

No utilizar únicamente una puerta cerrada sin explicación narrativa.

Una vez que se cumplan las condiciones de la misión, desbloquear el acceso.

Este sistema debe ser reutilizable para otras situaciones:

- Puertas que requieren llaves.
- Caminos que requieren herramientas.
- Personajes que solicitan objetos.
- Zonas que requieren completar misiones.
- Mecanismos que necesitan determinados elementos.
- Escenarios que requieren resolver acertijos.

## 8. Utilización real de la linterna

La linterna no debe funcionar únicamente como un requisito administrativo para entrar a la caverna.

Al ingresar, debe tener una utilidad visual y jugable.

Implementar, según las capacidades del motor existente:

- Oscurecimiento ambiental del escenario.
- Área de iluminación alrededor de Sofía o haz de luz orientado hacia su dirección de movimiento.
- Transiciones suaves de iluminación.
- Posibilidad de descubrir elementos que inicialmente permanecen en la oscuridad.
- Integración de la linterna con las mecánicas de exploración.

La primera entrada a la caverna debe producir una sensación de descubrimiento y aventura.

La linterna permanecerá disponible en el inventario para utilizarse posteriormente en otros mundos cuando corresponda.

## 9. Sistema general de misiones y objetos

No programar esta secuencia exclusivamente para Platón mediante código rígido.

Crear una arquitectura modular, reutilizable y configurable que permita definir nuevas misiones sin tener que reprogramar toda la lógica.

El sistema deberá admitir:

- Conversar con un personaje.
- Buscar un objeto.
- Recoger un objeto.
- Utilizar un objeto.
- Equipar un objeto.
- Entregar un objeto.
- Regresar con un personaje.
- Visitar una ubicación.
- Desbloquear una zona.
- Resolver un minijuego.
- Activar mecanismos.
- Encadenar diferentes objetivos.
- Completar misiones.

Cada misión debe poder contener múltiples etapas, condiciones, diálogos, requisitos, recompensas y consecuencias sobre el mundo.

Los diálogos de los personajes deberán cambiar dependiendo del progreso del jugador.

## 10. Herramientas de edición

Integrar estas nuevas funcionalidades en el editor existente del videojuego, siempre que su arquitectura lo permita.

Desde el editor debe ser posible:

- Colocar objetos interactivos dentro de los escenarios.
- Cambiar sus sprites, posiciones y dimensiones.
- Configurar sus zonas de interacción.
- Determinar qué objetos pueden recogerse.
- Asociarlos con misiones.
- Configurar requisitos para acceder a puertas o zonas.
- Establecer condiciones de desbloqueo.
- Definir diálogos según el estado de una misión.
- Configurar qué ocurre cuando se recoge o utiliza un objeto.
- Crear nuevas misiones y cadenas de objetivos.

El propósito es que en el futuro pueda diseñar nuevas aventuras filosóficas sin modificar manualmente el código fuente para cada misión.

## 11. Filosofía del diseño jugable

El videojuego no debe convertirse en una novela visual en la que el estudiante solamente lea y avance diálogos.

La experiencia debe combinar:

- Narrativa filosófica.
- Exploración.
- Movimiento del personaje.
- Conversaciones.
- Búsqueda de objetos.
- Resolución de problemas.
- Descubrimiento de escenarios.
- Minijuegos educativos.

Los diálogos deben generar acciones y las acciones deben permitir avanzar en la historia.

La enseñanza filosófica debe integrarse, siempre que sea posible, en lo que el jugador experimenta y realiza.

En este caso, la búsqueda de la linterna también representa simbólicamente la búsqueda del conocimiento y el tránsito de la oscuridad hacia la luz.

## 12. Secuencia jugable esperada

La experiencia completa deberá funcionar en este orden:

1. Sofía aterriza en el planeta.
2. Explora los alrededores.
3. Encuentra a Platón.
4. Conversa con él.
5. Descubre la existencia de la caverna.
6. Recibe la misión de buscar la linterna.
7. Explora el escenario.
8. Encuentra y recoge la linterna.
9. Descubre el funcionamiento del inventario.
10. Regresa con Platón.
11. Mantiene una segunda conversación.
12. Desbloquea la entrada.
13. Ingresa a la caverna.
14. Utiliza la linterna para explorar.
15. Continúa con la aventura relacionada con la alegoría de la caverna.

## 13. Requisitos de implementación

Antes de programar, revisa el código actual del proyecto e identifica qué componentes existentes pueden reutilizarse o ampliarse.

No elimines funcionalidades anteriores ni sustituyas innecesariamente los sistemas que ya funcionan.

Mantén la coherencia estética del videojuego. Los objetos deben parecer elementos pertenecientes al mundo y no simples emojis o botones colocados sobre el paisaje.

Comprueba el funcionamiento de la misión completa, los estados de los diálogos, el inventario, el bloqueo de la caverna, la persistencia de los objetos y los controles móviles y de escritorio.

Implementa la experiencia de manera funcional y jugable, no solamente como una demostración visual, documentación o propuesta técnica.

La prioridad es que esta primera misión constituya la base tecnológica y narrativa de todas las futuras aventuras de Sofía.
# SOFÍA Y LOS MUNDOS DE LAS IDEAS
## ACTUALIZACIÓN DEL MOTOR Y GENERADOR AUTOMÁTICO DE MUNDOS

Actúa como desarrollador senior especializado en Phaser, TypeScript y videojuegos educativos 2D.

Quiero mejorar mi proyecto existente para crear rápidamente mundos filosóficos, interiores, personajes, diálogos y conexiones mediante configuraciones, **sin reprogramar cada escenario ni generar imágenes nuevas continuamente**.

La prioridad actual es la jugabilidad: movimiento, exploración, diálogos, NPC, escaleras, puertas y navegación. Los gráficos definitivos y los minijuegos complejos vendrán después.

## 1. CONSERVAR TODO LO EXISTENTE

**No reconstruyas el proyecto desde cero.**

Revisa lo que ya está implementado, identifica los componentes funcionales y reutilízalos.

Especialmente:

- **Platón:** su planeta y experiencias existentes deben conservarse.
- **Sartre:** su planeta y experiencias existentes deben conservarse.
- Mantén sus personajes, escenas, diálogos, conexiones y progreso.
- Corrige errores sin eliminar funcionalidades que ya funcionan.
- Realiza cambios incrementales y comprueba que no aparezcan regresiones.

Los cuatro mundos nuevos serán **Camus, Hegel, Kant y Heidegger**, adicionales a Platón y Sartre.

## 2. BIBLIOTECA DE ESCENARIOS GENÉRICOS

Crea plantillas prediseñadas y reutilizables:

- Planeta circular caminable en 360°.
- Habitación con suelo plano.
- Caverna.
- Escenario horizontal.
- Escenario con escaleras.
- Escenario con dos niveles.
- Escenario con ascensor.
- Portal entre mundos.

Cada plantilla debe tener movimiento, controles, geometría y puntos de aparición ya configurados.

**No generes un escenario nuevo cada vez.** Instancia las plantillas mediante datos.

## 3. FONDOS ÚNICOS Y SUELOS UNIFORMES

Quiero **una sola imagen principal por escenario**, no fondos construidos con múltiples capas.

Los personajes, puertas y objetos interactivos serán sprites independientes.

Para interiores utiliza una resolución lógica de **1280 × 720**, con el suelo principal plano en **Y = 560**.

Reglas obligatorias:

- Todos los interiores equivalentes deben mantener la misma altura visual del suelo.
- Sofía debe caminar con los pies correctamente apoyados.
- Las imágenes deben representar visualmente el mismo suelo definido por el motor.
- No generar pisos irregulares ni diferentes alturas accidentales.
- La geometría de movimiento será independiente de la imagen.
- Escaleras, rampas y plataformas elevadas solo se incluirán cuando se indiquen expresamente.
- Utiliza componentes reutilizables para subir, bajar y cambiar de nivel.

Para los planetas circulares conserva el movimiento radial de 360° con orientación correcta y radio estable.

Permite reemplazar posteriormente los fondos genéricos por imágenes definitivas sin modificar la jugabilidad.

## 4. CONEXIONES AUTOMÁTICAS

Crea un sistema común de puertas y portales basado en identificadores.

Debe permitir:

- Planeta → interior.
- Interior → planeta.
- Interior → otro interior.
- Planeta → otro planeta.
- Retorno a la entrada correspondiente.
- Conservación del progreso.

Quiero poder pedir conexiones mediante lenguaje natural, sin configurarlas manualmente.

El motor debe validar automáticamente los destinos y puntos de aparición.

## 5. SISTEMA UNIVERSAL DE NPC

Crear una biblioteca de sprites genéricos reutilizables, separando tres conceptos:

**Apariencia (`spriteId`):** imagen provisional del personaje.

**Identidad (`characterId`):** personaje único con nombre, personalidad, diálogos y progreso.

**Instancia (`instanceId`):** aparición concreta del personaje en una escena.

Ejemplo:

- Creo a **Sísifo** usando un NPC genérico.
- Reutilizo a ese mismo Sísifo en distintas escenas, conservando su identidad.
- Utilizo el mismo sprite para crear otro personaje llamado Marco, con identidad independiente.
- Posteriormente reemplazo la apariencia de Sísifo por una ilustración definitiva y sus apariciones se actualizan sin afectar a Marco.

Implementa un catálogo donde pueda crear personajes, reutilizar identidades, cambiar apariencias y asignar diálogos según la escena.

## 6. MOTOR UNIVERSAL DE DIÁLOGOS

Prioriza un sistema de conversaciones configurable mediante datos:

- Nombre y retrato.
- Texto progresivo.
- Preguntas y respuestas.
- Diálogos ramificados.
- Condiciones y consecuencias.
- Memoria de conversaciones anteriores.
- Diálogos específicos según la escena.
- Activación de eventos y puertas.

**Al llegar por primera vez a cada planeta, Sofía debe conocer al filósofo titular**, quien introduce brevemente el problema fundamental de su pensamiento.

El mismo filósofo podrá tener nuevos diálogos durante la exploración.

## 7. CUATRO MUNDOS NUEVOS DE PRUEBA

Crea estos mundos utilizando **únicamente plantillas genéricas y recursos provisionales**. No desarrolles todavía ilustraciones definitivas.

### MUNDO 1: ALBERT CAMUS — EL ABSURDO

- Planeta circular con Camus como filósofo anfitrión.
- Escenario interior de montaña con un camino y una roca.
- NPC **Sísifo**, cuya identidad debe poder reutilizarse posteriormente.
- Diálogo entre Sofía y Sísifo sobre el esfuerzo repetitivo, el absurdo y la relación entre conciencia y rebelión.
- Entrada y salida funcionales.
- Portal filosófico hacia Sartre, conservando el planeta de Sartre existente.

### MUNDO 2: GEORG W. F. HEGEL — LA TRANSFORMACIÓN

- Planeta circular con encuentro inicial con Hegel.
- Interior genérico con dos niveles y escaleras.
- NPC que presenta una situación de cambio y conflicto.
- Conversación interactiva sobre contradicción, desarrollo histórico y dialéctica.
- Sofía podrá subir al nivel superior y continuar el diálogo con otro personaje.
- Puerta de regreso al planeta.

**Precisión filosófica:** no reducir la dialéctica hegeliana a la fórmula simplificada «tesis, antítesis y síntesis».

### MUNDO 3: IMMANUEL KANT — CONOCIMIENTO Y MORAL

- Planeta circular con encuentro inicial con Kant.
- Interior genérico tipo observatorio o sala de estudio.
- Objetos examinables relacionados con la experiencia y el conocimiento.
- NPC con diálogo sobre cómo conocemos la realidad.
- Una segunda habitación con una situación moral para conversar sobre el deber y las máximas de acción.
- Puertas y retorno funcionales.

No reducir la ética kantiana a escoger la opción que produzca más beneficios.

### MUNDO 4: MARTIN HEIDEGGER — EL SER Y LA EXISTENCIA

- Planeta circular con encuentro inicial con Heidegger.
- Interior genérico con un sendero, una cabaña y una puerta.
- NPC que plantea preguntas sobre nuestra vida cotidiana, las posibilidades y el tiempo.
- Conversación sobre el ser-en-el-mundo, el cuidado y la existencia humana.
- Puerta hacia otra habitación con un diálogo relacionado con la temporalidad.
- Retorno funcional al planeta.

Distinguir cuidadosamente el pensamiento de Heidegger del existencialismo de Sartre.

### REGLA PARA LOS CUATRO MUNDOS

No necesito todavía desarrollar toda su filosofía ni crear minijuegos avanzados.

Quiero comprobar que los mundos se crean rápidamente, que Sofía camina correctamente y que funcionan los diálogos, personajes, escaleras, puertas y conexiones.

Los escenarios genéricos se reemplazarán posteriormente por paisajes filosóficos definitivos.

## 8. EDITOR VISUAL MÍNIMO

Aprovecha el proyecto existente para añadir un modo de edición sencillo que permita:

- Mover, escalar y orientar objetos.
- Colocar NPC nuevos o existentes.
- Cambiar sus apariencias.
- Modificar puertas y destinos.
- Editar diálogos.
- Ajustar suelos y escaleras.
- Importar imágenes.
- Guardar configuraciones.

No construyas un editor completo como Genially.

La **creación automática mediante datos debe ser prioritaria**; el editor solo servirá para corregir visualmente cuando sea necesario.

## 9. GENERADOR AUTOMÁTICO

Quiero solicitar mediante una sola instrucción:

«Crea los planetas de Camus, Hegel, Kant y Heidegger utilizando las plantillas genéricas. Coloca sus filósofos, genera los interiores indicados, asigna NPC, incorpora diálogos y conecta las escenas».

Codex debe generar principalmente archivos de configuración, no código nuevo.

Implementa validaciones de identificadores, personajes, conexiones, puntos de aparición, diálogos, geometría y recursos.

El sistema debe permitir crear varios mundos en una sola operación.

## 10. ORDEN DE IMPLEMENTACIÓN

1. Revisar y conservar el proyecto actual, especialmente Platón y Sartre.
2. Corregir movimiento y suelos.
3. Estabilizar las plantillas genéricas.
4. Crear conexiones automáticas.
5. Implementar el catálogo de NPC con identidades independientes.
6. Consolidar el motor de diálogos.
7. Generar los cuatro mundos nuevos.
8. Añadir el editor visual mínimo.
9. Verificar todos los recorridos y conexiones.

No programes todavía todos los minijuegos. Solo deja preparada la arquitectura para incorporarlos posteriormente.

## RESULTADO ESPERADO

Al finalizar, deben existir **seis planetas en total**, contando los dos ya existentes:

- Platón — conservar.
- Sartre — conservar.
- Camus — nuevo.
- Hegel — nuevo.
- Kant — nuevo.
- Heidegger — nuevo.

Los cuatro planetas nuevos deben permitir:

- Caminar 360°.
- Conocer al filósofo.
- Conversar con NPC.
- Entrar y salir de interiores.
- Subir escaleras donde corresponda.
- Viajar entre mundos mediante portales.
- Mantener el progreso.
- Reemplazar después los sprites y fondos provisionales.

Verifica su funcionamiento real, sin presentar funciones pendientes como terminadas.

**PRINCIPIO RECTOR: conservar los avances existentes y generar rápidamente nuevos mundos mediante plantillas, datos y mecánicas compartidas, dedicando el trabajo a la navegación y los diálogos, no a rehacer escenarios o programar lo mismo continuamente.**
# Plantilla de plataformas nativas — Sofía

Abre `plantilla-plataformas.json` en GDevelop 5.6.287 o superior. Está en la misma carpeta que `game.json` para reutilizar los recursos de `assets/`, pero es un proyecto independiente. No se han cambiado los mundos del juego actual. Conserva toda la carpeta de recursos.

## Edita la escena

1. Abre Plantilla_Plataformas_Nativas y pulsa Vista previa.
2. Arrastra Suelo, Muro, Plataforma y Escalera desde Objetos. Redimensiona sus instancias. Suelo y Muro son plataformas sólidas; Plataforma permite atravesarla al saltar desde abajo; Escalera permite subir y bajar. No necesitas añadir eventos para cada nueva instancia.
3. Selecciona Sofia > Comportamientos > PlatformerObject. Cambia velocidad, salto, gravedad y aceleración. A/D o flechas, Espacio, flechas arriba/abajo y botones táctiles de prueba.
4. Selecciona las capas FondoLejano, FondoMedio, Base, PrimerPlano y UI. Añade tus propias imágenes como objetos Sprite independientes. Los eventos del grupo 02 controlan los factores de cámara (0.18, 0.5, 1 y 1.12). UI permanece fija. Los fondos existentes son recursos de Sofía reutilizados provisionalmente; para una composición artística final usa imágenes separadas sin terreno pintado.
5. Cambia el aspecto del piso en el objeto Suelo (imagen de Tiled Sprite). El tamaño de cada instancia define la superficie. Las texturas actuales de piso, muro, pasarela y escalera reutilizan un recurso oscuro de interfaz a modo de maqueta, no constituyen un tileset final. Puedes sustituirlas por texturas repetibles de piedra, tierra o madera.
6. Selecciona Platón, Pergamino, Portal, Enemigo y Antorcha y cámbialos de lugar. El grupo 03 incluye un diálogo de ejemplo y una condición de recogida. El grupo 04 reinicia la posición al caer o tocar el enemigo. No hay combate ni Yarn integrado en esta prueba: el diálogo es un evento de texto nativo, el portal marca el final pero no cambia de escena.
7. Duplica la escena en el administrador y cambia sus fondos, pisos y obstáculos. Si la quieres incorporar a otro proyecto, copia/importa escena y recursos conservando nombres y referencias; verifica sus variables y eventos.

## Qué es nativo

- 26 objetos, 46 instancias, cinco capas y 18 eventos estándar, agrupados en cuatro bloques.
- Platformer Character y Platform, controles simulados, animaciones Sprite, cámara, colisiones, variables, cambio de texto y recogida.
- Cero bloques JavaScript y cero dependencias de SofiaKit/SofiaUniverso.

## Validación

Se comprobó el JSON, las referencias de los objetos, los comportamientos y que los recursos referenciados figuran en el proyecto original. No se abrió ni ejecutó desde este entorno. La primera prueba en el editor debe verificar la máscara de colisión de Sofía, plataformas, escalera, teclado y controles táctiles; el acabado artístico y la compatibilidad móvil se deben ajustar mediante vista previa. Para publicar, exporta este proyecto a HTML5 en una carpeta separada, por ejemplo `public/lab/play-platformer/`, y nunca sobre el juego principal. La publicación automática de esta nueva escena no está configurada.

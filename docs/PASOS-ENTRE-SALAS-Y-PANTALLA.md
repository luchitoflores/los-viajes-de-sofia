# Pasos entre salas y exploración sin avisos permanentes

## Decisión del autor

Los corredores conectados se cruzan caminando. Las puertas y los portales conservan interacción explícita cuando tiene sentido. Un requisito narrativo bloquea el paso; un aviso breve explica por qué, sin abrir una conversación que detenga al jugador.

## Datos y editor

Los objetos interiores de tipo `door` admiten `passage`:

- `manual`: tocar/hacer clic, como antes. Es el valor implícito fuera de las conexiones canónicas.
- `left`: cruzar caminando hacia la izquierda.
- `right`: cruzar caminando hacia la derecha.

El inspector muestra **Cómo cruzar este acceso**. Se conservan el ID, el comportamiento, los requisitos y la cadena de acciones. El campo se valida y se incluye en los JSON exportados. Elegir `manual` explícitamente evita que la compatibilidad de un borrador antiguo reactive el cruce al caminar.

Platón activa los corredores A→B→C→D→E y sus regresos. El regreso de D conserva la ruta real usada para llegar (normalmente C). El acceso opcional antiguo B→D y las salidas a superficie conservan interacción explícita. El portal azul de E sigue exigiendo completar la aventura. No se ha simplificado el segundo ascenso ni eliminado ningún requisito.

La activación requiere movimiento en la dirección configurada y suelo a la altura del acceso. Estar cerca o aparecer en una habitación no inicia el paso. Un acceso bloqueado detiene el avance y muestra un aviso una vez hasta alejarse. Usa el historial y las acciones comunes `enter`/`return`; conserva al compañero y el estado del mundo.

## Pantalla

La ruta de juego ocupa el viewport completo y no bloquea orientación. En horizontal el canvas llena la pantalla con escala proporcional (`ENVELOP`); se recorta el excedente, sin estirar sprites. La cámara lateral compensa el recorte ampliando sus límites, para conservar visible a Sofía en descansos altos y bajos. No se cambian pisos, tamaños del personaje ni coordenadas guardadas.

En vertical se mantiene el canvas completo (`FIT`) dentro del espacio disponible y la cabecera se distribuye en varias filas. Pueden quedar márgenes: no se fuerza el giro del teléfono. Las rutas del editor conservan su espacio de trabajo y escala ajustada.

## Avisos

- Los objetivos completos quedan en su botón/panel, con el estado de misión actualizado. Se retira la tarjeta permanente sobre el escenario.
- Avisos de cambio de objetivo y recogida: 2,8 segundos, compactos, sin capturar clic/toque.
- Recoger un objeto conserva inventario, sonido/animación y acciones posteriores, y deja de abrir un mensaje duplicado que exigía avanzar para volver a caminar. Los diálogos narrativos y decisiones reales se conservan.
- Los avisos se ocultan visualmente durante un diálogo y el atributo `hidden` prevalece sobre las reglas de estilo.

## Validación

`npm run build`, `npm test` y `tests/browser_passages_layout.py`. Las pruebas de navegador usan perfiles aislados, clic/teclado y toque emulado; no modifican las partidas del autor. No equivale a una prueba en un teléfono físico. El script comprueba los caminos bloqueados/abiertos, regreso, acompañante, caducidad de avisos y orientación.

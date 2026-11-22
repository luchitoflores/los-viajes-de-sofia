# Embarque y vuelo

Toca la nave en la superficie. Sofía se acerca, entra y aparece en la cabina. Elige un planeta en el selector ilustrado o pulsa **Bajar de la nave**. La selección de un destino reproduce despegue, vuelo, aterrizaje y desembarque; después continúa el encuentro inicial si es la primera visita. El botón Mundos conserva su navegación habitual y los portales conservan su funcionamiento.

Actualización posterior del autor: el encuentro inicial ya no se abre automáticamente. Sofía desembarca cerca del filósofo y el jugador elige conversar mediante toque, clic o E/Enter. Historia y Libre tienen partidas separadas; véase [MODOS-Y-GUARDADO.md](MODOS-Y-GUARDADO.md).

`src/engine/spaceflight.ts` compone la cabina usando la nave y el retrato ilustrados existentes. El embarque usa los fotogramas estables de marcha, sin reducir el tamaño de Sofía. La escena Phaser `Spaceflight` reproduce el viaje; permite omitir la animación y acorta sus duraciones si el navegador solicita movimiento reducido. No es una mecánica de pilotaje manual.

`src/worlds/spaceport.ts` reutiliza la nave colocada en un mundo y proporciona un puerto común a las configuraciones antiguas que no la contienen. No sustituye sus objetos ni modifica el JSON publicado de Sartre. El editor puede conservar el puerto al guardar su composición. La llegada desde la nave siempre abre la superficie y sitúa a Sofía junto al puerto; conserva descubrimientos, conversaciones y actividades.

Los controles se bloquean durante el embarque y el viaje. La selección de destinos sigue accesible mientras Sofía está a bordo. Los estados transitorios no se guardan: una recarga conserva la partida del último mundo cargado, sin dejar a Sofía invisible dentro de una nave.

Sofía utiliza una única nave. Los objetos de nave de los mundos son sus puntos de estacionamiento. `dockShip` anima el propio sprite de superficie al despegar y aterrizar, con la piloto moviéndose junto a la cabina. En la Polis, la nave permanece independiente del escenario horneado para que no quede una copia dibujada al despegar. Al llegar, la nave comienza en el aire, desciende al punto de apoyo y solo después Sofía desembarca; no aparece otra nave estacionada esperando el viaje.

Compatibilidad: una nave antigua con `interaction: none` y un comportamiento de examen, como la de Sartre, también cuenta como la nave existente. Se habilita su embarque en ejecución, conservando su ID, recurso y ubicación. Si un borrador contiene además un puerto automático duplicado, se conserva la nave original y se retiran las copias de la escena activa; los demás objetos y el JSON publicado permanecen intactos.

Verificación: `npm run test:spaceflight` ejecuta clic real y toque emulado en Chrome. Los resultados y capturas se guardan en `captures/spaceflight-validation.json`, `sofia-vuelo-entre-mundos.png` y `sofia-aterrizaje-camus.png`.

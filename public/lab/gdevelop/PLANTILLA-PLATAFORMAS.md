# Plantilla maestra de plataformas nativas — Sofía · v1.1.1

Proyecto independiente: `plantilla-plataformas.json` en GDevelop 5.6.287 o superior. Mantén completa la carpeta `assets/`. No sustituye `game.json` ni el videojuego original.

## Escenas
- **Plantilla_Plataformas_Nativas**: recorrido lateral de prueba, 34 objetos, 54 instancias, 46 eventos estándar en ocho grupos y cinco capas.
- **Plantilla_Fin_Demo**: segunda escena de demostración, 6 objetos, 6 instancias, 3 eventos. Retorno al inicio mediante botón o Enter.
- Cero bloques JavaScript; no depende de SofiaKit ni SofiaUniverso.

## Prueba de juego
1. Abre la primera escena y pulsa Vista previa. A/D o flechas: caminar; Espacio: saltar; flechas arriba/abajo: escalera.
2. Acércate a Platón; pulsa E o el botón Acción. Lee las tres líneas de Yarn y avanza con E/Acción. El diálogo bloquea los controles de movimiento durante la conversación.
3. Recoge la antorcha situada después del hueco. Se registra en inventario y se habilita el pergamino elevado. La segunda antorcha es decoración; no es arma.
4. Sube a la plataforma, recoge el pergamino, sigue al punto de control y acércate a los guardianes. F o Ataque permite golpear a los enemigos en alcance. Hay uno estático y uno patrullero.
5. Comprueba los cinco puntos de vida, el intervalo de ataque y la invulnerabilidad temporal. Al perder toda la vida, Sofía reaparece en el último punto de control; se restauran los enemigos aún vivos, se conservan los objetos y los guardianes ya derrotados.
6. Acércate al portal y pulsa E/Acción. Antes de derrotar a ambos enemigos debe permanecer cerrado. Después cambia de escena. Enter o Volver reinicia la demostración.
7. Haz también una vista previa aislada de Plantilla_Fin_Demo.

## Autoría visual
- Arrastra Suelo, Muro, Plataforma y Escalera desde Objetos y cambia su tamaño. Suelo y Muro: sólidos. Plataforma: atravesable desde abajo. Escalera: Ladder.
- Texturas PNG propias repetibles: piedra cálida, bloques gris azulados, madera y escalera con transparencia. Son recursos provisionales de maqueta, no arte final. Sustituye la imagen del objeto Tiled Sprite sin alterar su comportamiento.
- En Sofia > PlatformerObject ajusta velocidad, salto, gravedad y aceleración.
- Capas FondoLejano, FondoMedio, Base (capa sin nombre), PrimerPlano y UI. Grupo 02: factores de cámara 0.18, 0.5, 1 y 1.12. UI fija. Los fondos reutilizados todavía contienen terreno pintado: para acabado final usa capas independientes.
- Grupo 03: Yarn. Recurso `assets/plantilla-dialogos.json`, rama Inicio. Edita con Yarn desde el selector de recursos de la acción de carga. La muestra contiene líneas, no elecciones ramificadas.
- Grupo 04: variables Mision (0 hablar, 1 antorcha, 2 pergamino, 3 combate, 4 portal), Antorchas, PergaminoRecogido, CheckpointX/Y. Para otro escenario ajusta sus coordenadas y objetivos; el checkpoint es una antorcha de prueba.
- Grupo 05: variables de escena Vida, VidaMax, DanoAtaque, AlcanceAtaque, IntervaloAtaque e Invulnerabilidad. Objeto Enemigo: Vida, VidaMax, Dano, Velocidad, LimiteIzq, LimiteDer y Direccion. Duplica Enemigo y modifica variables de instancia; Velocidad=0 lo deja estático. Ataque radial simple de proximidad, sin proyectiles ni animaciones especiales todavía.
- Grupo 06: variable de escena DestinoPortal, comprueba que exista antes de cambiar. El capítulo de pergamino en el juego real requerirá ERCA, no basta recoger el objeto de esta maqueta.
- Grupo 07: HUD. Inventario, vida y objetivo actual. La misión e inventario permanecen durante reintentos en la escena; no existe aún guardado permanente ni inventario global entre aventuras.
- Duplica la escena para nuevas aventuras, conserva nombres/recursos y adapta objetivos, puntos de control, límites de cámara y destino. Los eventos siguen siendo editables. No modifiques las escenas del juego principal hasta validar esta prueba.

## Validación y pendientes
Se comprobaron estructura JSON, nombres de objetos, instancias, capas y referencias de recursos. Los identificadores de nuevas acciones y condiciones se cotejaron con la referencia de GDevelop (Dialogue Tree, Variables, Scene, Objects, Timers). Aún no se ha ejecutado ni exportado con GDevelop en este entorno: verificar controles y colisiones de Sofía, carga Yarn, hitboxes, daño, reinicio y transición real, especialmente en móvil. La pulsación táctil usa eventos de ratón compatibles con toque; no se ha probado multitáctil. No se afirma que la demo esté publicada ni jugable en navegador. Falta arte definitivo, ataque animado/retroceso y efectos, diálogos con elecciones, guardado, inventario y misiones globales, ERCA, plantilla radial independiente e integración de ambas con el juego original. Exportar HTML5 en carpeta separada `public/lab/play-platformer/`; nunca sobre el juego principal.

Referencias: https://wiki.gdevelop.io/gdevelop5/all-features/dialogue-tree/reference/ · https://wiki.gdevelop.io/gdevelop5/all-features/variables/reference/ · https://wiki.gdevelop.io/gdevelop5/all-features/scene/reference/ .

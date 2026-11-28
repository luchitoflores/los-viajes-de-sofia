# Caverna ilustrada: editar y jugar en GDevelop

**Archivo:** `plantilla-plataformas.json`. Es la misma plantilla; no abrir `game.json`, que corresponde al prototipo anterior.

**Escena principal del rediseño:** `Laboratorio_Mundo_Sombras`. En el planeta, usar el acceso del laboratorio de sombras/caverna pintada. También se puede seleccionar esa escena y pulsar Vista previa. `Plantilla_Plataformas_Nativas` comparte el nuevo arte y el mecanismo, conservando su misión anterior.

## Qué se puede probar

En la caverna, saltar el primer obstáculo, detenerse en el suelo antes del hueco y saltar hasta la plataforma elevada. Allí hay una palanca. Con Sofía cerca, pulsar **E**, **Enter**, **Usar** o tocar la palanca. El prisionero de abajo pasa del sprite encadenado de espaldas al sprite libre, y la cadena independiente desaparece. No se activa por pasar cerca ni al tocarla desde lejos.

El aviso de rescate dura unos segundos. Salir al planeta y volver conserva las celdas liberadas durante esa ejecución. Es un ejemplo de mecánica para componer aventuras; no sustituye el guion definitivo de las cinco habitaciones de Platón.

## Parallax editable

Las piezas nuevas aparecen en la carpeta de objetos **Arte · parallax independiente**:

| Objeto | Capa | Ajuste de escena | Valor inicial |
|---|---|---|---|
| CavernaProfunda | FondoLejano | ParallaxFondo | 0.16 |
| ParedDeSombras | FondoMedio | ParallaxPared | 0.42 |
| RocaPrimerPlano | PrimerPlano | ParallaxFrente | 1.12 |
| Sofía, plataformas, mecanismo y NPC | Base | velocidad normal | 1 |

Un factor menor desplaza la capa más despacio y la hace parecer lejana. Cambiar las variables de escena y probar caminando. `AnchoMundo` define el límite horizontal de cámara; no crea suelo automáticamente.

Las sombras del caballo, árbol y figura están pintadas en la pared. Su capa se mueve mediante parallax: no se presenta como una animación nueva de los personajes que proyectan las sombras.

## Crear otro rescate sin programar

1. Seleccionar y duplicar las instancias `MecanismoRescate`, `PrisioneroRescate` y `CadenaPrisionero`.
2. En las variables de **cada instancia**, poner la misma `Clave` nueva, por ejemplo `celda-2`. Cada conjunto debe tener una clave distinta; repetir una clave vincula deliberadamente sus objetos.
3. Colocar al prisionero sobre suelo y al mecanismo en una zona alcanzable. Las cadenas son decoración vinculada, sin colisión.
4. En el mecanismo, `Activado` comienza en 0. `Radio` determina la distancia de interacción. Probar el acceso con saltos y escaleras reales.

Los eventos están en **Eventos externos → Mecanica_Rescate_Celda** y se enlazan desde ambas escenas. Son eventos visuales nativos, con selección por instancia y variables; no hay eventos JavaScript personalizados en esta plantilla.

El estado se guarda en la estructura global `CeldasLiberadas`; `SesionRescate` separa los reinicios confirmados. El mecanismo nuevo conserva estado entre escenas durante la partida, pero todavía no incorpora guardado propio en disco/nube: cerrar y volver a iniciar la vista previa reinicia ese estado. El guardado por hitos anterior de la plantilla permanece independiente.

## Suelo y obstáculos

Los suelos y plataformas ilustrados conservan los comportamientos nativos `Platform`. Las plataformas elevadas son `Jumpthru`; los muros son sólidos y las escaleras conservan `Ladder`. Las superficies de apoyo se han alineado con los sprites nuevos. Puedes mover, redimensionar y ajustar sus máscaras desde GDevelop.

El fondo, las sombras y el primer plano no tienen física. No hace falta pintar un fondo nuevo para cambiar el recorrido: reorganiza los objetos jugables.

## Recursos

- Imágenes de juego: `assets/caverna-v3/`.
- PNG maestros de los cinco recursos generados: `art-source/gdevelop-caverna-v3/` en el repositorio.
- Se reutilizan los sprites ilustrados existentes de Sofía y del prisionero. La liberación cambia de pose/sprite y retira cadenas; no es una animación nueva dibujada de desencadenarse.

Antes de reabrir una versión actualizada externamente, conservar cualquier edición pendiente de GDevelop con Guardar como en otra copia. El editor abierto no reemplaza automáticamente el proyecto que tiene en memoria.

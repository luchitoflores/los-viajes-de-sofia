# Maestros del rediseño de la caverna

Generados con la herramienta gráfica de imágenes el 27 de noviembre de 2026. Se conservan los PNG originales sin modificarlos. Los WebP de juego están en `public/lab/gdevelop/assets/caverna-v3/`.

- `fondo-profundo.png`: fondo lejano azul, sin plataformas ni personajes.
- `pared-sombras.png`: panel de piedra iluminado, sombras pintadas y transparencia exterior.
- `primer-plano.png`: marco de roca con centro transparente.
- `plataforma-piedra.png`: pieza modular de piedra con transparencia.
- `palanca-bronce.png`: mecanismo independiente, no pintado en el escenario.

Preparación técnica: WebP de calidad 92; recorte de márgenes transparentes de plataforma y palanca; alineación del borde transitable de la plataforma. `bloque-piedra.webp` deriva de una sección central de la plataforma. `control-fondo.png` es una placa de interfaz creada con formas simples, independiente del arte generado.

El manifiesto identifica los recursos optimizados y sus maestros. Los datos jugables y los eventos nativos se editan en `plantilla-plataformas.json`; no hace falta ejecutar un generador ni un editor propio para crear habitaciones o mecanismos.

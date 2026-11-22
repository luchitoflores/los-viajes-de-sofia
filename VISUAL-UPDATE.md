# Actualización visual: interiores, personajes y compañero

Se conserva la exploración circular de la Polis. Esta actualización cambia la presentación y convierte al prisionero liberado en un compañero persistente.

## Dirección visual

- Los 17 filósofos del álbum tienen un sprite y un retrato nuevos: rostro expresivo y proporciones compatibles con Sofía, con rasgos y vestimenta propios de su época.
- Biblioteca, caverna y ascenso comparten la piedra dorada, los detalles verde azulado y la arquitectura griega del exterior. Los fondos anteriores se conservan en los archivos originales.
- La galaxia presenta cuatro miniplanetas ilustrados con sus nombres, selección y botón de exploración. Las imágenes de Angry Birds se utilizaron como referencia de composición; no se incorporan sus personajes ni capturas al juego.
- La Polis mantiene su recorrido radial. Las otras tres entradas conservan las visitas breves existentes; esta actualización no convierte esas muestras en capítulos completos.

## El prisionero y la caverna

El hilo toma como referencia [el Genially del autor](https://view.genially.com/6587a334899e670015f70abd): observar a los prisioneros, investigar las sombras, obtener una llave, liberar a uno, avanzar hacia la luz y volver a dialogar.

1. Escucha al prisionero en la cámara de sombras.
2. Relaciona las siluetas con sus causas.
3. Habla con el guardián y resuelve la distinción entre doxa y episteme para obtener la llave.
4. Vuelve al prisionero y abre las cadenas.
5. El compañero camina contigo, cambia de dirección, te sigue por las escaleras y aparece contigo en el exterior y en el planeta.
6. Después de hablar con Platón puedes regresar juntos a la caverna.

Los objetivos se consultan en su botón; no se muestran como un panel permanente. Los personajes y elementos interactivos son sprites independientes de los fondos.

La liberación se guarda en `sofia_phaser_real_v02`, usando las partidas anteriores. Una partida que ya tenía al prisionero libre recibe también la marca de la nueva llave, para no bloquear ese avance. El compañero se reúne con Sofía al cambiar de escena o recargar; no sustituye el control de la protagonista ni bloquea su paso.

## Código y recursos

- `src/cast.ts`: identidades, rutas de sprites/retratos y secuencia de misiones.
- `src/companion-model.ts`: seguimiento lateral y radial, salto y posicionamiento.
- `src/companion.ts`: sprite y animaciones compartidas de marcha y reposo.
- `src/galaxy.ts`: selección de mundos y miniaturas.
- `src/main.ts`: recorrido de la caverna, guardián, llave, liberación, retorno y escenas laterales.
- `src/planet-scene.ts`: incorporación del compañero a la superficie circular.
- `public/assets/cast-*.png`, `portrait-*.png`: filósofos y sus caras; `companion-*.png`: tres poses del prisionero.
- `public/assets/polis-library-v2.png`, `polis-cave-v2.png`, `polis-ascent-v2.png`: interiores coherentes.
- `public/assets/world-*.png`: miniaturas de selección, separadas de los objetos del mundo navegable.
- `public/assets/cave-*.png`: lámpara, guardián, cadenas, llave, títere y papiro.
- `ASSET-PROMPTS-V2.md`: prompts y referencias de generación con image_gen.

## Verificar

```sh
npm run check
npm test
npm run build
npm run dev
npm run test:story
```

La prueba `tests/browser_story.py` abre Chrome con una partida aislada. Recorre la caverna con teclado, completa el reto, obtiene la llave, libera al prisionero, comprueba marcha, giro, ascenso, salida, retorno al planeta y persistencia tras recarga. Registra `captures/story-validation.json` y capturas reales. `SOFIA_URL` permite ejecutarla contra otro servidor, por ejemplo `http://127.0.0.1:4173` después de compilar y ejecutar preview.

Las seis pruebas del modelo radial original se mantienen y se añaden cuatro del compañero y sus recursos. La prueba integral anterior del planeta sigue en `tests/browser_planet.py`.

## Resultado de la validación de producción

TypeScript y Vite compilaron; las diez pruebas del modelo pasaron. `tests/browser_story.py` completó el recorrido y persistencia del compañero sin errores de navegador. `tests/browser_planet.py` comprobó 360,67° y 361,05° de recorrido, salto, conversaciones, recogida, regreso exacto de ambos interiores, arrastre con ratón y toque emulado, propiedades, exportación/importación, deshacer y persistencia, sin errores de navegador. Informes: `captures/story-validation.json` y `captures/validation.json`.

Capturas auténticas de la compilación servida en el puerto 4173: `captures/galaxia-ilustrada.png`, `captures/biblioteca-coherente.png`, `captures/companero-caverna.png`, `captures/companero-ascenso.png`, `captures/platon-nuevo-estilo.png` y `captures/companero-planeta.png`.

No se probó en un teléfono físico. Las otras tres épocas conservan sus visitas breves, sin ampliar todavía sus capítulos.

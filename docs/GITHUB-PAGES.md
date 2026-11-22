# Publicación en GitHub Pages

Repositorio indicado por el autor: https://github.com/luchitoflores/los-viajes-de-sofia

El repositorio contiene como raíz los archivos de `sofia_phaser_v1`, no la carpeta completa con el prototipo HTML y documentos adjuntos del directorio padre. El README inicial del repositorio se sustituye por la guía real del juego; se conserva el historial.

El workflow `.github/workflows/pages.yml` instala con `npm ci`, ejecuta las pruebas de datos, compila TypeScript/Vite y publica `dist`. Se ejecuta con cada push a `main` o manualmente. No se suben `node_modules`, `dist`, capturas ni `.env`. Se conservan fuentes, arte, mundos, scripts y pruebas. El arte público suma aproximadamente 51 MB; ningún recurso supera 50 MB en esta revisión.

En Settings → Pages → Build and deployment, seleccionar **GitHub Actions**. La URL prevista es https://luchitoflores.github.io/los-viajes-de-sofia/ . Esa URL solo se considera publicada cuando el workflow termina y una comprobación HTTP/navegador tiene éxito.

Vite usa `base: './'`; los recursos se resuelven bajo el repositorio y la navegación usa hash, por ejemplo `/#/edicion`, `/#/dialogos` y `/#/preguntas`. El HTML usa recursos relativos y Vite reescribe las referencias de CSS al compilar para esta base. Las rutas de contenido y los JSON permanecen relativas al documento.

Para actualizaciones desde esta carpeta:

```powershell
npm run check
npm test
git add .
git commit -m "Describe el cambio"
git push origin main
```

## Guardados y contenido del editor

GitHub Pages sirve archivos estáticos; no es una base de datos. Partidas, recursos cargados y borradores del editor se guardan en el navegador. Localhost y GitHub Pages tienen almacenamientos separados: el guardado local no aparece automáticamente en la web ni se comparte entre visitantes.

Para publicar cambios hechos con el editor: exportar el proyecto, usar `scripts/apply-project.ts` primero en comprobación y luego `--apply`, revisar y subir los archivos resultantes. No subir datos de partidas para incluirlos por defecto. Véase `MOTOR-Y-RUTAS.md`. El workflow publica los JSON y recursos versionados, no los borradores de IndexedDB.

Fuentes oficiales consultadas:
- https://vite.dev/guide/static-deploy#github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

Comprobación inicial del repositorio: privado; la API devolvió 422 al activar Pages porque el plan actual no admite Pages en este repositorio privado. Cambiar su privacidad requiere autorización explícita del autor; no hacerlo como efecto implícito de una publicación.

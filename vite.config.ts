import {defineConfig} from 'vite';
import {fileURLToPath, URL} from 'node:url';

// La aventura conserva index.html; el playground es una pagina independiente.
// Recursos relativos compatibles con localhost y GitHub Pages.
export default defineConfig({
  base:'./',
  build:{
    rollupOptions:{
      input:{
        game:fileURLToPath(new URL('./index.html',import.meta.url)),
        mechanics:fileURLToPath(new URL('./playground.html',import.meta.url))
      }
    }
  }
});

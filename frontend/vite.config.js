import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento, o navegador chama "/backend/..." no próprio Vite,
// que repassa para o servidor Express. Assim não é preciso CORS no backend.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const alvo = env.VITE_PROXY_TARGET || 'http://localhost:3000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/backend': {
          target: alvo,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/backend/, ''),
        },
      },
    },
  };
});

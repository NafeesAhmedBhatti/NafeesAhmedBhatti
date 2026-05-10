import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      {
        name: 'inject-api-keys',
        transformIndexHtml(html) {
          return html.replace(
            '</head>',
            `<script>window.__AI_API_KEY="${env.OPENAI_API_KEY || ''}";window.__AI_BASE_URL="${env.OPENAI_BASE_URL || ''}";</script></head>`
          );
        },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
    server: { host: '0.0.0.0', port: 3000, headers: { 'Cache-Control': 'no-store' } },
    preview: { host: '0.0.0.0', port: 3000, headers: { 'Cache-Control': 'no-store' } },
  };
});
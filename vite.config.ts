import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.BASE_URL_API' : JSON.stringify(env.BASE_URL_API),
        'process.env.APP_LOGIN_USERNAME': JSON.stringify(env.APP_LOGIN_USERNAME),
        'process.env.APP_LOGIN_PASSWORD': JSON.stringify(env.APP_LOGIN_PASSWORD)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

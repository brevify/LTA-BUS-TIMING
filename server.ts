import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import healthHandler from './api/health.ts';
import busArrivalHandler from './api/busarrival.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Mount serverless endpoints
  app.all('/api/health', (req, res) => healthHandler(req, res));
  app.all('/api/busarrival', (req, res) => busArrivalHandler(req, res));

  // Also support alias paths matching LTA DataMall naming
  app.all('/api/lta/BusArrival', (req, res) => busArrivalHandler(req, res));
  app.all('/api/lta/BusArrivalv2', (req, res) => busArrivalHandler(req, res));
  app.all('/api/v3/BusArrival', (req, res) => busArrivalHandler(req, res));

  if (!isProd) {
    // Mount Vite middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static build in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (dev: ${!isProd})`);
  });
}

startServer();

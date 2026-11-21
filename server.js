import express from 'express';
import cors from 'cors';
import { createBareServer } from '@tomphttp/bare-server-node';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { join } from 'path';
import { hostname } from 'os';

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ IMPORTANTE: Reemplaza con la URL de tu GitHub Pages
const FRONTEND_URL = 'https://TU-USUARIO.github.io';

// Configurar CORS para permitir peticiones desde GitHub Pages
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-bare-host', 'x-bare-protocol', 'x-bare-port', 
                   'x-bare-path', 'x-bare-headers', 'x-bare-forward-headers']
}));

// Crear el Bare Server (el que hace las peticiones reales)
const bare = createBareServer('/bare/');

// Servir los archivos de Ultraviolet
app.use('/uv/', express.static(uvPath));

// Ruta de health check (para que Render no duerma el servidor)
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Ultraviolet Backend funcionando',
    bare: '/bare/'
  });
});

// Iniciar servidor HTTP
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en puerto ${PORT}`);
  console.log(`📡 Bare Server en: http://${hostname()}:${PORT}/bare/`);
});

// Manejar peticiones del Bare Server
server.on('request', (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  }
});

// Manejar WebSockets (necesario para algunas webs)
server.on('upgrade', (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  }
});

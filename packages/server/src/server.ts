import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import fs from 'fs-extra';
import YAML from 'yaml';

import type { IConfig } from './config'

import storage from './routes/storage';

const PORT = process.env['PORT'] || 3000;
const ENV = process.env['NODE_ENV'] || 'development';

const app = express();
const server = createServer(app);
const io = new Server(server);

if (ENV == 'production') {
  app.use(express.static(new URL('../../frontend/dist', import.meta.url).pathname));
} else {
  app.use((_req, res, next) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:8080');
    next();
  });
}

io.on('connection', (_socket) => {
});

const configPath = new URL('../../../config/config.yaml', import.meta.url).pathname;
if (!await fs.pathExists(configPath)) {
  console.error(`Config file not found at ${configPath}`);
  process.exit(1);
}

const config = YAML.parse(await fs.readFile(configPath, 'utf-8')) as IConfig;

app.use('/storage', storage(config));

server.listen(PORT, () => {
  console.log(`Server up with port: ${PORT}, env: ${ENV}`);
});

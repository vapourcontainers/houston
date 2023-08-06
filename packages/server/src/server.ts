import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';

const PORT = process.env['PORT'] || 3000;
const ENV = process.env['NODE_ENV'] || 'development';

const app = express();
const server = createServer(app);
const io = new Server(server);

if (ENV == 'production') {
  app.use(express.static(new URL('../../frontend/dist', import.meta.url).pathname));
}

io.on('connection', (socket) => {
});

server.listen(PORT, () => {
  console.log(`Server up with port: ${PORT}, env: ${ENV}`);
});

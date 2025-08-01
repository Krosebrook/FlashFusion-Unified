import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import setupWebSocket from './websocket/WebSocketHandler';
import generateRoute from './api/generate';
import templateRoute from './api/templates';
import statusRoute from './api/status';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/generate', generateRoute);
app.use('/api/templates', templateRoute);
app.use('/api/status', statusRoute);

const server = createServer(app);
setupWebSocket(server);

server.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});
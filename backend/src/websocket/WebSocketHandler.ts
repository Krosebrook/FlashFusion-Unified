import { Server } from 'http';
import { WebSocketServer } from 'ws';

const setupWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
      const message = msg.toString();
      if (message === 'ping') ws.send('pong');
    });
    ws.send('WebSocket connected');
  });
};

export default setupWebSocket;
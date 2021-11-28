import { WebSocket } from 'ws';
import * as http from 'http';

interface Color {
    r: number;
    g: number;
    b: number;
}

interface Point {
    x: number;
    y: number;
    z: number;
    color?: Color;
}

const setupWebSocketServer = (server: http.Server): void => {
    const wss = new WebSocket.Server({ server });
    wss.on('connection', (ws: WebSocket) => {
        console.log('New connection!');

        // connection is up, let's add a simple simple event
        ws.on('message', (message: string) => {
        // log the received message and send it back to the client
            console.log('received: %s', message);
            ws.send(`Hello, you sent -> ${message}`);

            // Broadcast
            wss.clients.forEach((client) => {
                client.send('Broadcast message');
            });
        });

        // send immediatly a feedback to the incoming connection
        ws.send('Hi there, I am a WebSocket server');

        setInterval(() => {
            const numPoints = Math.round(Math.random() * 2);
            const points: Point[] = [];
            for (let i = 0; i < numPoints; i++) {
                points.push({
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    z: Math.random() * 100,
                });
            }
            ws.send(JSON.stringify({ points }));
        }, 1000);
    });
};

export default setupWebSocketServer;

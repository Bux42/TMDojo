import { Server } from 'http';
import { createServer } from 'net';
import { WebSocket } from 'ws';
import parseBuffer from './bufferParser';

let wss: any;
let allData = Buffer.from('');

const broadcastToWebsocketClients = (messageJson: string) => {
    if (wss !== undefined) {
        wss.clients.forEach((client: any) => {
            client.send(messageJson);
        });
    }
};

const startSocketServer = (server: Server): void => {
    const tcpSocketServer = createServer((socket) => {
        console.log('Plugin Connected! (New TCP Connection)');

        socket.write('Echo server\r\n');

        socket.on('data', (data: Buffer) => {
            allData = Buffer.concat([allData, data]);

            const findNextSampleStartIndex = () => allData
                .slice(4)
                .findIndex((_, i) => i + 4 < allData.length - 4 && allData.readInt32LE(i + 4) === -666);

            let foundIndex = findNextSampleStartIndex();

            while (foundIndex !== -1 && foundIndex > 4) {
                // Get SampleBuffer slice
                const sampleBuffer = allData.slice(4, foundIndex + 4);

                // Parse and send data
                const parsedBuffer = parseBuffer(sampleBuffer);
                broadcastToWebsocketClients(JSON.stringify(parsedBuffer));

                // Remove this part of the sample data from the total buffer
                allData = allData.slice(foundIndex + 4);

                // If possible, find the next start sample start index
                foundIndex = findNextSampleStartIndex();
            }
        });
    });

    tcpSocketServer.listen(1337, '127.0.0.1');

    wss = new WebSocket.Server({ server });
    wss.on('connection', (ws: WebSocket) => {
        console.log('Live Viewer Connected! (New WebSocket Connection)');
        ws.send('Hi there, I am a WebSocket server');
    });
};

export default startSocketServer;

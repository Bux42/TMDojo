import { Server } from 'http';
import { createServer, Socket } from 'net';
import { WebSocket } from 'ws';
import parseBuffer from './bufferParser';

let wss: any;
const sockets: Socket[] = [];
// const allData = Buffer.from('');
// const startCollectingSample = false;

const liveViewerClients : Socket[] = [];

let allAllData = Buffer.from('');

// const completedSingleSample = false;

// const broadcast = (jsonMessage: string) => {
//     sockets.forEach((socket) => {
//         console.log(`Sending message: ${jsonMessage}`);

//         socket.write(jsonMessage);
//     });
// };

const sendToLiveViewerClients = (buffer: Buffer) => {
    console.log(liveViewerClients.length);

    liveViewerClients.forEach((client) => {
        client.write(buffer);
    });
};

const broadcastToWebsocketClients = (messageJson: string) => {
    if (wss !== undefined) {
        wss.clients.forEach((client: any) => {
            client.send(messageJson);
        });
    }
};

const startSocketServer = (server: Server): void => {
    const tcpSocketServer = createServer((socket) => {
        console.log('New connection!');

        sockets.push(socket);

        socket.write('Echo server\r\n');
        socket.pipe(socket);

        // When receive client data.
        socket.on('data', (data: Buffer) => {
            if (data.toString() === 'live-viewer') {
                console.log('New live viewer client');

                liveViewerClients.push(socket);
            }

            allAllData = Buffer.concat([allAllData, data]);
            // console.log(allAllData);

            let foundIndex = allAllData
                .slice(4)
                .findIndex((_, i) => i + 4 < allAllData.length - 4 && allAllData.readInt32LE(i + 4) === -666);

            while (foundIndex !== -1 && foundIndex > 4) {
                const sampleBuffer = allAllData.slice(4, foundIndex + 4);
                console.log('Sample buffer:');
                console.log(sampleBuffer);

                const parsed = parseBuffer(sampleBuffer);
                broadcastToWebsocketClients(JSON.stringify(parsed));
                sendToLiveViewerClients(sampleBuffer);
                allAllData = allAllData.slice(foundIndex + 4);

                foundIndex = allAllData
                    .slice(4)
                    .findIndex((_, i) => i + 4 < allAllData.length - 4 && allAllData.readInt32LE(i + 4) === -666);
            }
        });

        // When receive client data.
        /*
        socket.on('data', (data: Buffer) => {
            if (completedSingleSample) return;

            console.log(`Received data: ${data}`);

            let isStartPacket = false;

            parseBuffer(data);

            if (data.length >= 4) {
                const int = data.readInt32LE(0);
                if (int === -666) {
                    isStartPacket = true;
                } else {
                    console.log(int);
                }
            }

            // parseBuffer(data);

            // Print received client data and length.
            // console.log(`Receive client send data : ${data}, data size : ${socket.bytesRead}`);

            // Server send data back to client use client net.Socket object.
            // socket.end(`Server received data : ${data}, send back to client data size : ${socket.bytesWritten}`);

            if (allData.length === 0 && isStartPacket && !startCollectingSample) {
                console.log('Start collecting sample');
                startCollectingSample = true;
            }

            if (isStartPacket) {
                if (allData.length > 0) {
                    console.log(`Sample data: ${allData}`);
                    const sample = parseBuffer(allData);
                    console.log(sample);

                    completedSingleSample = true;
                    broadcast(allData.toString());
                }
                allData = Buffer.from('');
            } else if (startCollectingSample) {
                allData = Buffer.concat([allData, data]);
            }

            // console.log(`All data: ${allData}`);
        });
        */

        // When client leaves
        socket.on('end', () => {
            console.log('Socket left the broadcast.\n');

            // Remove client from socket array
            sockets.splice(sockets.indexOf(socket), 1);
        });
    });

    tcpSocketServer.listen(1337, '127.0.0.1');

    wss = new WebSocket.Server({ server });
    wss.on('connection', (ws: WebSocket) => {
        console.log('New connection!');

        // connection is up, let's add a simple simple event
        ws.on('message', (message: string) => {
        // log the received message and send it back to the client
            console.log('received: %s', message);
            ws.send(`Hello, you sent -> ${message}`);

            // Broadcast
            wss.clients.forEach((client: any) => {
                client.send('Broadcast message');
            });
        });

        // send immediatly a feedback to the incoming connection
        ws.send('Hi there, I am a WebSocket server');

        // setInterval(() => {
        //     const numPoints = Math.round(Math.random() * 2);
        //     const points: Point[] = [];
        //     for (let i = 0; i < numPoints; i++) {
        //         points.push({
        //             x: Math.random() * 100,
        //             y: Math.random() * 100,
        //             z: Math.random() * 100,
        //         });
        //     }
        //     ws.send(JSON.stringify({ points }));
        // }, 1000);
    });
};

export default startSocketServer;

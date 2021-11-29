import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import * as THREE from 'three';
import { Socket } from 'net';
import Viewer3D from '../../components/viewer/Viewer3D';
import parseBuffer, { LiveSample } from '../../lib/live-viewer/bufferParser';

const positions: THREE.Vector3[] = [];
const colors: THREE.Color[] = [];

const LiveSocketPoints = ({ lastMessage, newSample, client }:
    {
        lastMessage?: MessageEvent<any> | null,
        newSample?: LiveSample | undefined,
        client?: Socket
    }) => {
    const [meshGeom, setMeshGeom] = useState<THREE.BufferGeometry>();

    // console.log('Inside LiveSocketPoints');
    // useEffect(() => {
    //     if (client) {
    //         console.log('Setting client listeners');

    //         client.on('data', (data) => {
    //             // console.log(`Received: ${data}`);
    //             const parsed = parseBuffer(data);
    //             console.log(parsed);
    //             if (parsed) {
    //                 addNewPoint(parsed);
    //             }
    //         });

    //         client.on('close', () => {
    //             console.log('Connection closed');
    //         });
    //     }
    // }, [client]);

    const addNewPoint = (point: LiveSample) => {
        console.log('New sample!');

        // const pos = point.position;
        // const col = new THREE.Color(1, 0.5, 0.5);
        // positions.push(pos);
        // colors.push(col);

        // console.log('New positions added');

        // const newMeshGeom = new THREE.BufferGeometry().setFromPoints(positions);

        // newMeshGeom.setAttribute(
        //     'color',
        //     new THREE.Float32BufferAttribute(colors.flatMap((c) => [c.r, c.g, c.b]), 3),
        // );

        // setMeshGeom(newMeshGeom);
    };

    useEffect(() => {
        if (lastMessage != null) {
            try {
                const parsedMessage = JSON.parse(lastMessage.data);

                console.log(parsedMessage);
                if (parsedMessage.position) {
                    const { position } = parsedMessage;
                    const pos = new THREE.Vector3(
                        parseFloat(position[0]),
                        parseFloat(position[1]),
                        parseFloat(position[2]),
                    );
                    const col = new THREE.Color(1, 0.5, 0.5);
                    positions.push(pos);
                    colors.push(col);

                    const newMeshGeom = new THREE.BufferGeometry().setFromPoints(positions);

                    newMeshGeom.setAttribute(
                        'color',
                        new THREE.Float32BufferAttribute(colors.flatMap((c) => [c.r, c.g, c.b]), 3),
                    );

                    setMeshGeom(newMeshGeom);
                }
            } catch (e) {
                // console.log(e);
            }
        }
    }, [lastMessage]);

    useEffect(() => {
        if (newSample != null) {
            addNewPoint(newSample);
        }
    }, [newSample]);

    return (
        <points geometry={meshGeom}>
            <pointsMaterial vertexColors />
        </points>
    );
};

const LiveViewer = (): JSX.Element => {
    // Public API that will echo messages sent to it back to the client
    const [socketUrl, setSocketUrl] = useState('ws://localhost');
    const [messageHistory, setMessageHistory] = useState<any[]>([]);

    const [lastSample, setLastSample] = useState<LiveSample | undefined>();
    // const [client, setClient] = useState<Socket | undefined>(undefined);

    // useEffect(() => {
    //     console.log('Connecting...');

    //     try {
    //         const newClient = new Socket();
    //         newClient.connect(1337, '127.0.0.1', () => {
    //             console.log('Connected');
    //             newClient.write('live-viewer');
    //             setClient(newClient);
    //         });
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }, []);

    const {
        sendMessage,
        lastMessage,
        readyState,
    } = useWebSocket(socketUrl);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    useEffect(() => {
        if (lastMessage !== null) {
            setMessageHistory((prev) => prev.concat(lastMessage));
        }
    }, [lastMessage, setMessageHistory]);

    return (
        <>
            <Layout>
                <span>
                    The WebSocket is currently
                    {' '}
                    {connectionStatus}
                </span>
                {lastMessage ? (
                    <span>
                        Last message:
                        {' '}
                        {lastMessage.data}
                    </span>
                ) : null}
                {messageHistory.length}
                <Layout.Content>
                    <Viewer3D
                        replaysData={[]}
                    >
                        <LiveSocketPoints lastMessage={lastMessage} />
                    </Viewer3D>
                </Layout.Content>
            </Layout>
        </>
    );
};

export default LiveViewer;

import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import * as THREE from 'three';
import Viewer3D from '../../components/viewer/Viewer3D';

const positions: THREE.Vector3[] = [];
const colors: THREE.Color[] = [];

const LiveSocketPoints = ({ lastMessage }: {lastMessage: MessageEvent<any> | null}) => {
    const [meshGeom, setMeshGeom] = useState<THREE.BufferGeometry>();

    useEffect(() => {
        if (lastMessage != null) {
            const parsedMessage = JSON.parse(lastMessage.data);

            if (parsedMessage.points) {
                const { points } = parsedMessage;

                points.forEach((p: any) => {
                    const pos = new THREE.Vector3(parseFloat(p.x), parseFloat(p.y), parseFloat(p.z));
                    const col = new THREE.Color(1, 0.5, 0.5);
                    positions.push(pos);
                    colors.push(col);
                });

                const newMeshGeom = new THREE.BufferGeometry().setFromPoints(positions);

                newMeshGeom.setAttribute(
                    'color',
                    new THREE.Float32BufferAttribute(colors.flatMap((c) => [c.r, c.g, c.b]), 3),
                );

                setMeshGeom(newMeshGeom);
            }
        }
    }, [lastMessage]);

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

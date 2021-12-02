import React, {
    Suspense,
    useCallback,
    useEffect, useMemo, useRef, useState,
} from 'react';
import { Layout } from 'antd';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useFBX } from '@react-three/drei';
import Viewer3D from '../../components/viewer/Viewer3D';
import vecToQuat from '../../lib/utils/math';

const positions: THREE.Vector3[] = [];
const colors: THREE.Color[] = [];

interface LiveSocketPointsProps {
    orbitControlsRef: any
}
export const LiveSocketPoints = ({ orbitControlsRef }: LiveSocketPointsProps) => {
    const mesh = useRef<THREE.Mesh>();
    const stadiumCarMesh = useRef<THREE.Mesh>();
    const camPosRef = useRef<THREE.Mesh>();
    const fbx = useMemo(() => useFBX('/StadiumCarWheelsSeparated.fbx'), []);

    const camera = useThree((state) => state.camera);

    const [meshGeom, setMeshGeom] = useState<THREE.BufferGeometry>();

    let curPos = new THREE.Vector3();

    // Public API that will echo messages sent to it back to the client
    const [socketUrl, setSocketUrl] = useState('ws://localhost');
    const [messageHistory, setMessageHistory] = useState<any[]>([]);

    const { lastMessage, readyState } = useWebSocket(socketUrl, {
        retryOnError: true,
        shouldReconnect: (closeEvent: CloseEvent) => closeEvent.type === 'close',
        reconnectInterval: 1000,
    });

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

    useFrame((state, delta) => {
        if (!(lastMessage && lastMessage.data
                && mesh.current
                && stadiumCarMesh.current
                && camPosRef.current)) {
            return;
        }

        try {
            const parsedMessage = JSON.parse(lastMessage.data);

            if (!(parsedMessage.position
                && parsedMessage.velocity
                && parsedMessage.up
                && parsedMessage.dir
                && parsedMessage.wheelAngle)) {
                return;
            }

            const {
                position, velocity, speed, up, dir, wheelAngle,
            } = parsedMessage;

            const pos = new THREE.Vector3(
                parseFloat(position[0]),
                parseFloat(position[1]),
                parseFloat(position[2]),
            );
            const vel = new THREE.Vector3(
                parseFloat(velocity[0]),
                parseFloat(velocity[1]),
                parseFloat(velocity[2]),
            );
            const carUp = new THREE.Vector3(
                parseFloat(up[0]),
                parseFloat(up[1]),
                parseFloat(up[2]),
            );
            const carDir = new THREE.Vector3(
                parseFloat(dir[0]),
                parseFloat(dir[1]),
                parseFloat(dir[2]),
            );

            // Get car rotation
            const carRotation: THREE.Quaternion = vecToQuat(
                carDir,
                carUp,
            );

            // Move & rotate 3D car from current sample rot & pos
            mesh.current.position.lerp(pos, 0.4);
            stadiumCarMesh.current.rotation.setFromQuaternion(carRotation);

            // Set front wheels rotation
            stadiumCarMesh.current.children[2].rotation.y = wheelAngle; // FL
            stadiumCarMesh.current.children[4].rotation.y = wheelAngle; // FR

            // Set wheel suspensions
            // stadiumCarMesh.current.children[1].position.setY(BACK_WHEEL_Y - (curSample.rRDamperLen * 100)); // RR
            // stadiumCarMesh.current.children[2].position.setY(FRONT_WHEEL_Y - (curSample.fLDamperLen * 100)); // FL
            // stadiumCarMesh.current.children[3].position.setY(BACK_WHEEL_Y - (curSample.rLDamperLen * 100)); // RL
            // stadiumCarMesh.current.children[4].position.setY(FRONT_WHEEL_Y - (curSample.fRDamperLen * 100)); // FR

            if (orbitControlsRef && orbitControlsRef.current
                && camPosRef && camPosRef.current) {
                curPos = pos.clone();

                orbitControlsRef.current.target.lerp(pos, 0.2);
                camPosRef.current.rotation.setFromQuaternion(carRotation);
                // move toward where the car is heading
                camPosRef.current.position.set(
                    -vel.x / 5,
                    -vel.y / 5,
                    -vel.z / 5,
                );
                camPosRef.current.translateZ(-7 - (speed / 30));
                camPosRef.current.translateY(2 + (speed / 200));
                // move camera to camPosMesh world position
                const camWorldPos: THREE.Vector3 = new THREE.Vector3();
                camPosRef.current.getWorldPosition(camWorldPos);
                camera.position.lerp(camWorldPos, 0.3);
            }
        } catch (e) {
            // Skip parse error
        }
    });

    useEffect(() => {
        if (lastMessage != null && lastMessage.data) {
            try {
                const parsedMessage = JSON.parse(lastMessage.data);
                if (parsedMessage.position) {
                    const { position } = parsedMessage;
                    const pos = new THREE.Vector3(
                        parseFloat(position[0]),
                        parseFloat(position[1]),
                        parseFloat(position[2]),
                    );
                    const col = new THREE.Color(
                        parsedMessage.inputIsBraking > 0 ? 1 : 0,
                        parsedMessage.inputGasPedal > 0 ? 1 : 0,
                        0,
                    );
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
                console.log(e);
            }
        }
    }, [lastMessage]);

    const onUpdate = useCallback(
        (self) => {
            self.setFromPoints(positions);
            self.setAttribute('color', new THREE.Float32BufferAttribute(colors.flatMap((c) => [c.r, c.g, c.b]), 3));
        },
        [],
    );

    return (
        <>
            <points geometry={meshGeom} scale={0.01}>
                <pointsMaterial vertexColors />
            </points>

            <line geometry={meshGeom}>
                <lineBasicMaterial
                    linewidth={10}
                    transparent
                    opacity={0.5}
                    linecap="round"
                    linejoin="round"
                    vertexColors
                />
            </line>

            <mesh
                position={[
                    curPos.x,
                    curPos.y,
                    curPos.z]}
                ref={mesh}
                scale={1}
            >

                <primitive
                    object={fbx}
                    dispose={null}
                    ref={stadiumCarMesh}
                    scale={0.01}
                    opacity={1}
                    receiveShadow
                    castShadow
                />

                <mesh
                    ref={camPosRef}
                >
                    <sphereBufferGeometry args={[0.1, 30, 30]} attach="geometry" />
                    <meshBasicMaterial color="white" transparent opacity={0} attach="material" />
                </mesh>

            </mesh>
        </>
    );
};

const LiveViewer = (): JSX.Element => {
    // Public API that will echo messages sent to it back to the client
    const [socketUrl, setSocketUrl] = useState('ws://localhost');
    const [messageHistory, setMessageHistory] = useState<any[]>([]);

    const { lastMessage, readyState } = useWebSocket(socketUrl, {
        retryOnError: true,
        shouldReconnect: (closeEvent: CloseEvent) => closeEvent.type === 'close',
        reconnectInterval: 1000,
    });

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
                    {`The WebSocket is currently ${connectionStatus}`}
                </span>
                <span>
                    {`Messages received: ${messageHistory.length}`}
                </span>
                <Layout.Content>
                    <Viewer3D
                        replaysData={[]}
                        isLiveViewer
                    />
                </Layout.Content>
            </Layout>
        </>
    );
};

export default LiveViewer;

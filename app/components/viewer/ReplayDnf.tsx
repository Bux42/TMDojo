import * as THREE from 'three';
import { Billboard, Text } from '@react-three/drei';
import React, { useRef } from 'react';
import { DoubleSide } from 'three';
import { ReplayData } from '../../lib/api/apiRequests';

interface ReplayDnfProps {
  replay: ReplayData;
}
const ReplayDnf = ({ replay }: ReplayDnfProps): JSX.Element => {
    const mesh = useRef();
    const dnfTextColor = new THREE.Color(1, 1, 1);
    return (
        <>
            <mesh position={replay.dnfPos} ref={mesh} scale={10}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial
                    attach="material"
                    color="red"
                    transparent
                    opacity={0.5}
                />
            </mesh>
            <Billboard position={replay.dnfPos} args={[0, 0]}>
                <Text
                    color={dnfTextColor}
                    fontSize={5}
                    maxWidth={200}
                    lineHeight={1}
                    letterSpacing={0.02}
                    textAlign="left"
                    font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                    anchorX="center"
                    anchorY="middle"
                >
                    <meshBasicMaterial attach="material" side={DoubleSide} color="red" />
                    DNF
                </Text>
            </Billboard>
        </>
    );
};

export default ReplayDnf;

import React, { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@three-ts/orbit-controls";
import * as THREE from "three";

const CameraController = () => {
    const { camera, gl } = useThree();

    useEffect(() => {
        const controls = new OrbitControls(camera, gl.domElement);

        controls.minDistance = 3;
        controls.maxDistance = Infinity;

        controls.enableZoom = true;
        controls.zoomSpeed = 5;

        return () => {
            controls.dispose();
        };
    }, [camera, gl]);

    return null;
};

const Grid = () => {
    const size = 48 * 32;
    const divisions = 32;
    const MID_COLOR = new THREE.Color(0.1, 0.1, 0.1);
    const GRID_COLOR = new THREE.Color(0.2, 0.2, 0.2);
    return <gridHelper args={[size, divisions, MID_COLOR, GRID_COLOR]} />;
};

export const ThreeJsScene = (): JSX.Element => {
    return (
        <div className="w-screen h-screen">
            <Canvas
                camera={{
                    fov: 45,
                    position: [800, 400, 800],
                    near: 0.1,
                    far: 50000,
                }}
            >
                <CameraController />
                <Grid />
            </Canvas>
        </div>
    );
};

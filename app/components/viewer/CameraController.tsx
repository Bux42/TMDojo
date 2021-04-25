import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@three-ts/orbit-controls";

export const CameraController = (): null => {
    const { camera, gl } = useThree();

    useEffect(() => {
        const controls = new OrbitControls(camera, gl.domElement);

        controls.minDistance = 3;
        controls.maxDistance = Infinity;

        controls.enableZoom = true;
        controls.zoomSpeed = 1;

        return () => {
            controls.dispose();
        };
    }, [camera, gl]);

    return null;
};

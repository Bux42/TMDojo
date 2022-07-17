import { useLayoutEffect, useRef } from 'react';
import {
    BufferGeometry, Euler, InstancedMesh, Object3D, Vector3,
} from 'three';

const o = new Object3D();

export interface Transform {
    pos: Vector3;
    rot: Euler;
}
interface InstancesProps {
    geometry: BufferGeometry;
    transforms: Transform[];
    material?: React.ReactNode;
}
export const Instances = ({ geometry, transforms, material }: InstancesProps) => {
    const ref = useRef<InstancedMesh>();

    useLayoutEffect(() => {
        if (!ref.current) return;

        for (let i = 0; i < transforms.length; i += 1) {
            const { pos, rot } = transforms[i];
            o.position.set(pos.x, pos.y, pos.z);
            o.rotation.set(rot.x, rot.y, rot.z);
            o.updateMatrix();
            ref.current.setMatrixAt(i, o.matrix);
        }

        ref.current.instanceMatrix.needsUpdate = true;
    }, [transforms]);

    return (
        <instancedMesh ref={ref} args={[null, null, transforms.length]} geometry={geometry} castShadow receiveShadow>
            {material || <meshNormalMaterial />}
        </instancedMesh>
    );
};

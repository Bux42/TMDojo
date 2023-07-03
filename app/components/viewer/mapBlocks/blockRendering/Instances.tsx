import React, { useLayoutEffect, useRef } from 'react';
import {
    Euler, InstancedMesh, Object3D, Vector3, Group, Mesh, Material, Color,
} from 'three';
import { BasicBlock } from './BasicBlocks';

const o = new Object3D();

export interface Transform {
    pos: Vector3;
    rot: Euler;
}
interface InstancesProps {
    group: Group;
    transforms: Transform[];
}

export const Instances = ({ group, transforms }: InstancesProps) => {
    const refs = useRef<(InstancedMesh | undefined)[]>(group.children.map(() => undefined));

    useLayoutEffect(() => {
        for (let i = 0; i < refs.current.length; i++) {
            const ref = refs.current[i];

            if (ref) {
                for (let j = 0; j < transforms.length; j++) {
                    const { pos, rot } = transforms[j];

                    o.position.copy(pos);
                    o.rotation.copy(rot);
                    o.updateMatrix();

                    ref.setMatrixAt(j, o.matrix);
                }

                ref.instanceMatrix.needsUpdate = true;
            }
        }
    }, [refs, transforms, transforms.length]);

    return (
        <>
            {group.children.map((child, index) => (
                child instanceof Mesh ? (
                    <instancedMesh
                        key={`instanced-mesh-of-child-${child.uuid}`}
                        ref={(e) => {
                            if (e && e instanceof InstancedMesh) {
                                refs.current[index] = e;
                            }
                        }}
                        args={[child.geometry, child.material, transforms.length]}
                    />
                ) : (
                    <BasicBlock
                        key={`placeholder-instanced-mesh-of-child-${group.children[index].uuid}`}
                        meshCoord={new Vector3(index * 8, index * 8, index * 8)}
                        materialProps={{
                            color: new Color(1, 0, 0),
                            opacity: 0.1,
                        }}
                    />
                )
            ))}
        </>
    );
};

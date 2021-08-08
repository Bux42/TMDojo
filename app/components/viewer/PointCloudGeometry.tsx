import { Sphere } from '@react-three/drei';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { DoubleSide, MeshNormalMaterial, PointsMaterial } from 'three';
import * as earcut from 'earcut';
import { ReplayData } from '../../lib/api/apiRequests';

interface PointInfo {
    vertices: THREE.Vector3[];
    colors: THREE.Color[];
    normals: THREE.Vector3[];
}
const getReplayPoints = (replaysData: ReplayData[]): PointInfo => {
    const vertices: THREE.Vector3[] = [];
    const colors: THREE.Color[] = [];
    const normals: THREE.Vector3[] = [];

    const WIDTH = 1.7;
    const LENGTH = 3;
    const DEFAULT_COLOR = new THREE.Color(0.8, 0.5, 0.1);

    const getColor = (groundMaterial: number) => {
        // Dirt
        if (groundMaterial === 6) {
            return new THREE.Color(0.2, 0.1, 0.0);
        }
        // Asphalt
        if (groundMaterial === 16) {
            return new THREE.Color(0.9, 0.9, 0.9);
        }
        // Water
        if (groundMaterial === 13) {
            return new THREE.Color(0.025, 0.025, 1);
        }
        // Metal
        if (groundMaterial === 4) {
            return new THREE.Color(0.1, 0.1, 0.1);
        }
        // Grass
        if (groundMaterial === 76) {
            return new THREE.Color(0.1, 0.9, 0.1);
        }
        return DEFAULT_COLOR;
    };

    replaysData.forEach((replay) => replay.samples.forEach((sample) => {
        const up = sample.up.clone();
        const side = sample.dir.clone().cross(up).multiplyScalar(WIDTH / 2);
        const front = sample.dir.clone().multiplyScalar(LENGTH / 2);
        const basePos = sample.position.clone().addScaledVector(front, 0.2);

        if (sample.rLGroundContactMaterial !== 80) {
            vertices.push(basePos.clone().sub(front).sub(side));
            colors.push(getColor(sample.rLGroundContactMaterial));
            normals.push(up);
        }
        if (sample.rRGroundContactMaterial !== 80) {
            vertices.push(basePos.clone().sub(front).add(side));
            colors.push(getColor(sample.rRGroundContactMaterial));
            normals.push(up);
        }

        if (sample.fLGroundContactMaterial !== 80) {
            vertices.push(basePos.clone().add(front).sub(side));
            colors.push(getColor(sample.fLGroundContactMaterial));
            normals.push(up);
        }
        if (sample.fRGroundContactMaterial !== 80) {
            vertices.push(basePos.clone().add(front).add(side));
            colors.push(getColor(sample.fRGroundContactMaterial));
            normals.push(up);
        }
    }));

    return { vertices, colors, normals };
};

const ReplayPointsMesh = ({ replaysData }: ReplayLinesProps) => {
    // const [geometry, setGeometry] = useState<any>();
    const [pointsGeom, setPointsGeom] = useState<any>();
    // const [trisGeom, setTrisGeom] = useState<any>();

    const [bufferVertices, setBufferVertices] = useState<THREE.Vector3[]>([]);
    const [bufferColors, setBufferColors] = useState<THREE.Color[]>([]);
    const [bufferNormals, setBufferNormals] = useState<THREE.Vector3[]>([]);

    const { vertices, colors, normals } = useMemo(() => getReplayPoints(replaysData), [replaysData]);

    // useEffect(() => {
    //     const setNewGeom = async () => {
    //         const bufferGeom = new THREE.BufferGeometry();
    //         bufferGeom.setAttribute(
    //             'position',
    //             new THREE.Float32BufferAttribute(vertices.flatMap((v) => [v.x, v.y, v.z]), 3),
    //         );

    //         // const { ConvexGeometry } = await import('three/examples/jsm/geometries/ConvexGeometry');
    //         // const { BufferGeometryUtils } = await import('three/examples/jsm/utils/BufferGeometryUtils');
    //         const { WireframeGeometry } = await import('three/src/geometries/WireframeGeometry');

    //         // let convex = new ConvexGeometry(vertices);
    //         // convex = BufferGeometryUtils.mergeVertices(convex, 0.1);
    //         // convex.computeVertexNormals();

    //         const wireframe = new WireframeGeometry(bufferGeom);

    //         setGeometry(wireframe);
    //     };
    //     setNewGeom();
    // }, [replaysData]);

    useEffect(() => {
        const setNewGeom = async () => {
            let bufferGeom = new THREE.BufferGeometry();
            bufferGeom.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(vertices.flatMap((v) => [v.x, v.y, v.z]), 3),
            );
            bufferGeom.setAttribute(
                'color',
                new THREE.Float32BufferAttribute(colors.flatMap((c) => [c.r, c.g, c.b]), 3),
            );
            bufferGeom.setAttribute(
                'normal',
                new THREE.Float32BufferAttribute(normals.flatMap((v) => [v.x, v.y, v.z]), 3),
            );
            const { BufferGeometryUtils } = await import('three/examples/jsm/utils/BufferGeometryUtils');
            bufferGeom = BufferGeometryUtils.mergeVertices(bufferGeom, 1);

            setPointsGeom(bufferGeom);

            const bufferVertices_: THREE.Vector3[] = [];
            const bufferColors_: THREE.Color[] = [];
            const bufferNormals_: THREE.Vector3[] = [];

            if (bufferGeom) {
                const p = bufferGeom.attributes.position.array;
                const c = bufferGeom.attributes.color.array;
                const n = bufferGeom.attributes.normal.array;

                for (let i = 0; i < p.length; i += 3) {
                    bufferVertices_.push(new THREE.Vector3(p[i], p[i + 1], p[i + 2]));
                    bufferColors_.push(new THREE.Color(c[i], c[i + 1], c[i + 2]));
                    bufferNormals_.push(new THREE.Vector3(n[i], n[i + 1], n[i + 2]));
                }
            }

            setBufferVertices(bufferVertices_);
            setBufferColors(bufferColors_);
            setBufferNormals(bufferNormals_);
        };
        setNewGeom();
    }, [replaysData]);

    // useEffect(() => {
    //     const setNewGeom = async () => {
    //         const triangleIndices = earcut.default(vertices.flatMap((v) => [v.x, v.y, v.z]), undefined, 3);

    //         const triPositions = triangleIndices.flatMap((index) => {
    //             const v = vertices[index];
    //             return [v.x, v.y, v.z];
    //         });

    //         let bufferGeom = new THREE.BufferGeometry();
    //         bufferGeom.setAttribute(
    //             'position',
    //             new THREE.Float32BufferAttribute(triPositions, 3),
    //         );
    //         const { BufferGeometryUtils } = await import('three/examples/jsm/utils/BufferGeometryUtils');
    //         bufferGeom = BufferGeometryUtils.mergeVertices(bufferGeom, 1);

    //         setTrisGeom(bufferGeom);
    //     };
    //     setNewGeom();
    // }, [replaysData]);

    return (
        <>
            {/* <mesh geometry={geometry}>
                <meshNormalMaterial />
            </mesh> */}
            {/* <mesh geometry={trisGeom}>
                <meshNormalMaterial />
            </mesh> */}
            <points
                geometry={pointsGeom}
            >
                <pointsMaterial vertexColors />
            </points>
            {/* {vertices.map((vertex, i) => (
                <mesh
                    position={vertex}
                    quaternion={(new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0, 0, 1), normals[i])}
                >
                    <planeGeometry args={[3, 3]} />
                    <meshPhongMaterial side={DoubleSide} color={colors[i]} />
                </mesh>
            ))} */}
            {bufferVertices.map((vertex, i) => (
                <mesh
                    position={vertex}
                    quaternion={(new THREE.Quaternion())
                        .setFromUnitVectors(new THREE.Vector3(0, 0, 1), bufferNormals[i])}
                    castShadow
                >
                    <planeGeometry args={[2.5, 2.5]} />
                    <meshPhongMaterial side={DoubleSide} color={bufferColors[i]} />
                </mesh>
            ))}
        </>
    );
};

interface ReplayLinesProps {
    replaysData: ReplayData[];
}
const PointCloudGeometry = ({
    replaysData,
}: ReplayLinesProps) => (
    <>
        {replaysData.length > 0 ? (
            <ReplayPointsMesh replaysData={replaysData} />
        ) : null}
    </>
);

export default PointCloudGeometry;

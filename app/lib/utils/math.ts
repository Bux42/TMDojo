import * as THREE from 'three';
import { Vector3 } from 'three';

const vec = new THREE.Vector3();
const vec2 = new THREE.Vector3();
const quat = new THREE.Quaternion();

export default function vecToQuat(forward: THREE.Vector3, up: THREE.Vector3): THREE.Quaternion {
    const vector = forward.normalize();
    const vector2 = vec.copy(new THREE.Vector3(0, 0, 0)).crossVectors(up, vector).normalize();
    const vector3 = vec2.copy(new THREE.Vector3(0, 0, 0)).crossVectors(vector, vector2);
    const m00 = vector2.x;
    const m01 = vector2.y;
    const m02 = vector2.z;
    const m10 = vector3.x;
    const m11 = vector3.y;
    const m12 = vector3.z;
    const m20 = vector.x;
    const m21 = vector.y;
    const m22 = vector.z;

    const num8 = (m00 + m11) + m22;
    const quaternion = quat;
    if (num8 > 0.0) {
        let num = Math.sqrt(num8 + 1.0);
        quaternion.w = num * 0.5;
        num = 0.5 / num;
        quaternion.x = (m12 - m21) * num;
        quaternion.y = (m20 - m02) * num;
        quaternion.z = (m01 - m10) * num;
        return quaternion;
    }
    if ((m00 >= m11) && (m00 >= m22)) {
        const num7 = Math.sqrt(((1.0 + m00) - m11) - m22);
        const num4 = 0.5 / num7;
        quaternion.x = 0.5 * num7;
        quaternion.y = (m01 + m10) * num4;
        quaternion.z = (m02 + m20) * num4;
        quaternion.w = (m12 - m21) * num4;
        return quaternion;
    }
    if (m11 > m22) {
        const num6 = Math.sqrt(((1.0 + m11) - m00) - m22);
        const num3 = 0.5 / num6;
        quaternion.x = (m10 + m01) * num3;
        quaternion.y = 0.5 * num6;
        quaternion.z = (m21 + m12) * num3;
        quaternion.w = (m20 - m02) * num3;
        return quaternion;
    }
    const num5 = Math.sqrt(((1.0 + m22) - m00) - m11);
    const num2 = 0.5 / num5;
    quaternion.x = (m20 + m02) * num2;
    quaternion.y = (m21 + m12) * num2;
    quaternion.z = 0.5 * num5;
    quaternion.w = (m01 - m10) * num2;
    return quaternion;
}

export const interpolateFloat = (
    a: number,
    b: number,
    factor: number,
): number => a * (1 - factor) + b * factor;

export const setInterpolatedVector = (
    smoothVec: Vector3,
    prevVec: Vector3,
    currentVec: Vector3,
    factor: number,
) => {
    smoothVec.set(
        interpolateFloat(prevVec.x, currentVec.x, factor),
        interpolateFloat(prevVec.y, currentVec.y, factor),
        interpolateFloat(prevVec.z, currentVec.z, factor),
    );
};

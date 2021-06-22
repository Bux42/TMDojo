import React from 'react';
import { Html } from '@react-three/drei';
import { CalculatePosition } from '@react-three/drei/web/Html';

const CenterSphere = () => {
    const overrideCalculatePosition: CalculatePosition = (el, camera, size) => [
        size.width / 2,
        size.height / 2,
    ];

    return (
        <Html
            calculatePosition={overrideCalculatePosition}
            style={{
                color: 'eeeeee',
                fontSize: 10,
                pointerEvents: 'none',
                userSelect: 'none',
            }}
        >
            ⬤
        </Html>
    );
};

export default CenterSphere;

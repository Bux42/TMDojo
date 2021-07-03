import { Stats } from '@react-three/drei';
import {
    addTail, useFrame, useThree,
} from '@react-three/fiber';

import React, { useEffect, useMemo, useRef } from 'react';

const FrameRate = (): JSX.Element => (
    <Stats className="ml-40" />
);

export default FrameRate;

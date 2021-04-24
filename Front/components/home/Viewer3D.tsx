import React from "react";
import { ThreeJsScene } from "./ThreeJsScene";

export const Viewer3D = (): JSX.Element => {
    return (
        <div style={{ zIndex: -10 }}>
            <ThreeJsScene />
        </div>
    );
};

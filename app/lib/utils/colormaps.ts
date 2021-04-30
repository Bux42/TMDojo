import * as THREE from "three";

export type ColorMap = { value: number; color: { r: number; g: number; b: number } }[];
export const getColorFromMap = (inputValue: number, colorMap: ColorMap): THREE.Color => {
    let i = 1;
    for (i = 1; i < colorMap.length - 1; i++) {
        if (inputValue < colorMap[i].value) {
            break;
        }
    }

    const lower = colorMap[i - 1];
    const upper = colorMap[i];

    const range = upper.value - lower.value;
    const rangePct = (inputValue - lower.value) / range;
    const pctLower = Math.min(1 - rangePct, 1);
    const pctUpper = Math.max(0, rangePct);

    const color = new THREE.Color(
        Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper) / 255,
        Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper) / 255,
        Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper) / 255
    );
    return color;
};

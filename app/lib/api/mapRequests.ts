import axios from "axios";
import { MapBlockData } from "../blocks/blockData";
import { FileResponse } from "./fileRequests";

export const fetchMapBlocks = async (file: FileResponse): Promise<MapBlockData> => {
    const params = {
        filePath: file.challengeId,
    };

    const res = await axios.get("http://localhost:3000/get-map-blocks", {
        params,
        responseType: "arraybuffer",
    });

    const { data } = res;
    const dataView = new DataView(data);
    const blockManager = new MapBlockData(dataView);

    return blockManager;
};

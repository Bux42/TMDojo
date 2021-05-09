import axios from "axios";

export const getTmxId = async (mapUId: string): Promise<string> => {
    const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + `/maps/${mapUId}/tmx`, {
        withCredentials: true,
    });

    // TODO: add proper error handling
    return res.data.tmxId;
};

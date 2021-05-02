import axios from "axios";

export const getTmxId = async (mapUId: string): Promise<string> => {
    const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/get-tmxid", {
        params: { mapUId },
        withCredentials: true,
    });

    // TODO: add proper error handling
    return res.data.tmxId;
};

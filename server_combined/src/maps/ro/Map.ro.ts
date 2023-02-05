export type MedalsRo = {
    bronze: number;
    silver: number;
    gold: number;
    author: number;
}

export class MapRo {
    _id: string;
    mapName: string;
    mapUId: string;
    authorName: string;
    fileUrl: string;
    thumbnailUrl: string;
    medals: MedalsRo;
}

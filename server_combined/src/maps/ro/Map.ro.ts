export class MapRo {
    _id: string;
    mapName: string;
    mapUId: string;
    exchangeId: number;
    authorName: string;
    authorId: string;
    fileUrl: string;
    thumbnailUrl: string;
    timestamp: string;
    medals: {
        bronze: number;
        silver: number;
        gold: number;
        author: number;
    };
}

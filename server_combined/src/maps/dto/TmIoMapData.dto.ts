export class TmIoMapDataDto {
    author: string;
    name: string;
    mapType: string;
    mapStyle: string;
    authorScore: number;
    goldScore: number;
    silverScore: number;
    bronzeScore: number;
    filename: string;
    isPlayable: boolean;
    mapId: string;
    mapUid: string;
    fileUrl: string;
    thumbnailUrl: string;
    authorplayer: {
        name: string,
        tag: string,
        id: string,
    };
    exchangeid: string
}

/*
Example response from: https://trackmania.io/api/map/gjt2DWATrQ_NdrbrXG0G9oDpTfh:

{
    author: '2116b392-d808-4264-923f-2bfcfa60a570',
    name: 'Winter 2023 - 01',
    mapType: 'TrackMania\\TM_Race',
    mapStyle: '',
    authorScore: 16020,
    goldScore: 17000,
    silverScore: 20000,
    bronzeScore: 25000,
    collectionName: 'Stadium',
    filename: 'Winter 2023 - 01.Map.Gbx',
    isPlayable: true,
    mapId: '0212f42d-bb92-4c26-8059-5ca7a5d7cfb6',
    mapUid: 'gjt2DWATrQ_NdrbrXG0G9oDpTfh',
    submitter: '2116b392-d808-4264-923f-2bfcfa60a570',
    timestamp: '2022-12-20T16:06:05+00:00',
    fileUrl: 'https://prod.trackmania.core.nadeo.online/storageObjects/ede92b30-5efb-43f2-9565-3725c87821df',
    thumbnailUrl: 'https://prod.trackmania.core.nadeo.online/storageObjects/bc2db8db-7547-4e0d-9195-009619c7f7ee.jpg',
    authorplayer: {
        name: 'softyB',
        tag: '$FC1NADEO',
        id: '2116b392-d808-4264-923f-2bfcfa60a570',
        zone: {
            name: "Val-d'Oise",
            flag: "Val-d'Oise",
            parent: [
                'Object',
            ],
        },
        meta: {
            vanity: 'softy',
            nadeo: true,
            twitter: 'softybck',
        },
    },
    submitterplayer: {
        name: 'softyB',
        tag: '$FC1NADEO',
        id: '2116b392-d808-4264-923f-2bfcfa60a570',
        zone: {
            name: "Val-d'Oise",
            flag: "Val-d'Oise",
            parent: [
                'Object',
            ],
        },
        meta: {
            vanity: 'softy',
            nadeo: true,
            twitter: 'softybck',
        },
    },
    exchangeid: 87424,
};
*/

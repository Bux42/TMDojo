/* eslint-disable max-classes-per-file */

export class TmIoPlayerRo {
    name: string;
    id: string;
    tag?: string;
    zone: {
        name: string;
        flag: string;
        parent: {
            name: string;
            flag: string;
            parent: {
                name: string;
                flag: string;
                parent: {
                    name: string;
                    flag: string;
                }
            }
        }
    };
    meta: {
        nadeo?: boolean;
        tmgl?: boolean;
        mastodon?: string;
        twitch?: string;
        twitter?: string;
        vanity?: string;
        youtube?: string;
    };
}

export class TmIoMapDataRo {
    author: string;
    name: string;
    mapType: string;
    mapStyle: string;
    authorScore: number;
    goldScore: number;
    silverScore: number;
    bronzeScore: number;
    collectionName: string;
    filename: string;
    isPlayable: boolean;
    mapId: string;
    mapUid: string;
    submitter: string;
    timestamp: string;
    fileUrl: string;
    thumbnailUrl: string;
    authorplayer: TmIoPlayerRo;
    submitterplayer: TmIoPlayerRo;
    exchangeid: number;
}

/*
Example response from mapUId: rUS5sqVqaZubmj0cJdNVVJ_NQvh

{
  "author": "73eba009-a074-4439-916f-d25d7fa7bc1c",
  "name": "NEO-CUPRA - $5c3THE GREAT CLIMB",
  "mapType": "TrackMania\\TM_Race",
  "mapStyle": "",
  "authorScore": 55555,
  "goldScore": 59000,
  "silverScore": 67000,
  "bronzeScore": 84000,
  "collectionName": "Stadium",
  "filename": "NEO-CUPRA - THE GREAT CLIMB.Map.Gbx",
  "isPlayable": true,
  "mapId": "a40c402c-6607-4c7c-b0bf-7af880d4208e",
  "mapUid": "rUS5sqVqaZubmj0cJdNVVJ_NQvh",
  "submitter": "73eba009-a074-4439-916f-d25d7fa7bc1c",
  "timestamp": "2023-02-02T17:12:43+00:00",
  "fileUrl": "https://prod.trackmania.core.nadeo.online/storageObjects/870ecf1d-ec80-4a52-8a63-6aa2323bc49a",
  "thumbnailUrl": "https://prod.trackmania.core.nadeo.online/storageObjects/5476c80a-9097-4789-8e72-4926faf93a73.jpg",
  "authorplayer": {
    "name": "florenzius_",
    "tag": "$S$F00▼$F60NDA",
    "id": "73eba009-a074-4439-916f-d25d7fa7bc1c",
    "zone": {
      "name": "Chemnitz",
      "flag": "Chemnitz",
      "parent": {
        "name": "Sachsen",
        "flag": "sachsen",
        "parent": {
          "name": "Germany",
          "flag": "GER",
          "parent": {
            "name": "Europe",
            "flag": "europe",
            "parent": {
              "name": "World",
              "flag": "WOR"
            }
          }
        }
      }
    },
    "meta": {
      "twitch": "florenzius_",
      "youtube": "UCWp3_ll24-qy164m5y6MJXA",
      "twitter": "florenzius"
    }
  },
  "submitterplayer": {
    "name": "florenzius_",
    "tag": "$S$F00▼$F60NDA",
    "id": "73eba009-a074-4439-916f-d25d7fa7bc1c",
    "zone": {
      "name": "Chemnitz",
      "flag": "Chemnitz",
      "parent": {
        "name": "Sachsen",
        "flag": "sachsen",
        "parent": {
          "name": "Germany",
          "flag": "GER",
          "parent": {
            "name": "Europe",
            "flag": "europe",
            "parent": {
              "name": "World",
              "flag": "WOR"
            }
          }
        }
      }
    },
    "meta": {
      "twitch": "florenzius_",
      "youtube": "UCWp3_ll24-qy164m5y6MJXA",
      "twitter": "florenzius"
    }
  },
  "exchangeid": 92417
}
*/

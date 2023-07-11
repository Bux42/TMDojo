/* eslint-disable max-classes-per-file */
/* eslint-disable camelcase */

export class JwtPayloadData {
    sub!: string;
    webId!: string;
    playerName!: string;
}

export class JwtPayload extends JwtPayloadData {
    iat!: number;
    exp!: number;
}

export class AccessTokenRo {
    access_token!: string;
}

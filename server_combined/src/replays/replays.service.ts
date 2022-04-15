import { Injectable } from '@nestjs/common';

export interface Replay {
    id: string;
    name: string;
}

@Injectable()
export class ReplaysService {
    getReplays(): string[] {
        return ['Replay 1', 'Replay 2', 'Replay 3'];
    }

    getReplayById(id: string): string {
        return `Replay with id: ${id}`;
    }

    deleteReplayById(id: string): string {
        return `Deleting replay with id: ${id}`;
    }

    // TODO: replace this with a getReplays method with all filters
    //     This was made temporarily to complete the /users/:webId/replays endpoint
    getUserReplaysByWebId(webId: string): string[] {
        return [`Replay 1 from ${webId}`, `Replay 2 from ${webId}`, `Replay 3 from ${webId}`];
    }

    uploadReplay(): string {
        return 'Uploading replay to DB...';
    }
}

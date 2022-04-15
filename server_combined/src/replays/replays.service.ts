import { Injectable } from '@nestjs/common';

@Injectable()
export class ReplaysService {
    // TODO: replace this with a getReplays method with all filters
    //     This was made temporarily to complete the /users/:webId/replays endpoint
    getUserReplaysByWebId(webId: string): string[] {
        return [`Replay 1 from ${webId}`, `Replay 2 from ${webId}`, `Replay 3 from ${webId}`];
    }
}

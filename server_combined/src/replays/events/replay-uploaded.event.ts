import { EVENT_KEYS } from '../../common/util/event-keys';
import { Map } from '../../maps/schemas/map.schema';
import { UserRo } from '../../users/dto/user.ro';
import { Replay } from '../schemas/replay.schema';

export class ReplayUploadedEvent {
    public static KEY = EVENT_KEYS.REPLAY_UPLOADED;

    constructor(
        public replay: Replay,
        public user: UserRo,
        public map: Map,
    ) { }
}

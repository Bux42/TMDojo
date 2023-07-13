import { EVENT_KEYS } from '../../common/util/event-keys';
import { MapRo } from '../../maps/dto/map.ro';
import { UserRo } from '../../users/dto/user.ro';
import { ReplayRo } from '../dto/replay.ro';

export class ReplayUploadedEvent {
    public static KEY = EVENT_KEYS.REPLAY_UPLOADED;

    constructor(
        public replay: ReplayRo,
        public user: UserRo,
        public map: MapRo,
    ) { }
}

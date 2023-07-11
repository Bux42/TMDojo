import { EVENT_KEYS } from '../../common/util/event-keys';
import { User } from '../schemas/user.schema';

export class UserCreatedEvent {
    public static KEY = EVENT_KEYS.USER_CREATED;

    constructor(
        public user: User,
    ) { }
}

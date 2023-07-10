import { ReplayRo } from "../../replays/ro/Replay.ro";
import { Replay } from "../../replays/schemas/replay.schema";

export class UserReplaysRo {
    replays: Replay[]; // TODO: use ReplayRo once implemented correctly
    totalResults: number;
}
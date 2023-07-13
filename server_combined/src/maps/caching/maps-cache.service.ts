import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cache } from 'cache-manager';
import { MyLogger } from '../../common/logger/my-logger.service';
import { calculateSkip } from '../../common/util/db/pagination';
import { TIME_IN_MS } from '../../common/util/time';
import { ReplayRo } from '../../replays/dto/replay.ro';
import { ReplayUploadedEvent } from '../../replays/events/replay-uploaded.event';
import { GroupedMapsByReplayRo } from '../dto/grouped-maps-by-replay.ro';
import { ListMapsDto } from '../dto/list-maps.dto';
import { MapRo } from '../dto/map.ro';
import { MapsService } from '../maps.service';

const MAPS_WITH_REPLAY_COUNTS_CACHE_KEY = 'MAPS_WITH_REPLAY_COUNTS_CACHE_KEY';

// Cache will be refreshed after this time, replay uploads should not reset this TTL
const CACHE_TTL = 1 * TIME_IN_MS.DAY;

@Injectable()
export class MapsCacheService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly mapsService: MapsService,
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(MapsCacheService.name);
    }

    async findAllWithReplayCounts(listMapsDto: ListMapsDto) {
        const {
            mapName, mapUId, limit, skip, skipPage,
        } = listMapsDto;

        const cached = await this.findOrCacheMapsWithoutFilter();

        const filtered = cached
            .filter((map) => {
                if (!mapName) return true;
                return map.mapName.toLowerCase().includes(mapName.toLowerCase());
            })
            .filter((map) => {
                if (!mapUId) return true;
                return map.mapUId === mapUId;
            });

        const calculatedSkip = calculateSkip({ limit, skip, skipPage });

        const skipped = calculatedSkip ? filtered.slice(calculatedSkip) : filtered;
        const limited = limit ? skipped.slice(0, limit) : skipped;

        return limited;
    }

    // Find maps with replay counts without filter to store in the cache
    private async findOrCacheMapsWithoutFilter() {
        const cached = await this.getMapsCache();

        if (cached) {
            this.logger.debug('Maps cache hit');
            return cached;
        }

        this.logger.debug('Maps cache miss');
        const maps = await this.mapsService.findAllWithReplayCounts();
        await this.setMapsCache(maps);
        return maps;
    }

    // Increment map cache whenever a replay is uploaded
    @OnEvent(ReplayUploadedEvent.KEY)
    private async handleReplayUploadedEvent(replayUploadedEvent: ReplayUploadedEvent) {
        await this.incrementMapReplayCount(replayUploadedEvent.map, replayUploadedEvent.replay);
    }

    private async incrementMapReplayCount(map: MapRo, replay: ReplayRo) {
        const cached = await this.findOrCacheMapsWithoutFilter();
        if (!cached) return;

        const { mapUId } = map;
        const { date } = replay;

        const mapFromCache = cached.find((cachedMap) => cachedMap.mapUId === mapUId);

        if (mapFromCache) {
            this.logger.debug('New replay: map found in cache, incrementing replay count');
            mapFromCache.count++;
            mapFromCache.lastUpdate = date;
        } else {
            this.logger.debug('New replay: map not found in cache, adding to cache');
            cached.push({
                ...map,
                count: 1,
                lastUpdate: date,
            });
        }

        this.logger.debug(map);

        await this.updateMapsCache(cached);
    }

    // Set new cache with TTL
    private async setMapsCache(maps: GroupedMapsByReplayRo[]): Promise<void> {
        await this.cacheManager.set(MAPS_WITH_REPLAY_COUNTS_CACHE_KEY, maps, CACHE_TTL);
    }

    // Update cache without changing TTL
    private async updateMapsCache(maps: GroupedMapsByReplayRo[]): Promise<void> {
        const prevTTL = await this.cacheManager.store.ttl(MAPS_WITH_REPLAY_COUNTS_CACHE_KEY);
        await this.cacheManager.set(MAPS_WITH_REPLAY_COUNTS_CACHE_KEY, maps, prevTTL);
    }

    // Get cache
    private async getMapsCache(): Promise<GroupedMapsByReplayRo[] | undefined> {
        return this.cacheManager.get(MAPS_WITH_REPLAY_COUNTS_CACHE_KEY);
    }
}

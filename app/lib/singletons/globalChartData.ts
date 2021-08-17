import Singleton from './singleton';

class GlobalChartsData {
    hoveredRaceTime?: number;
    constructor() {
        this.hoveredRaceTime = undefined;
    }
}

const GlobalChartsDataSingleton = Singleton(GlobalChartsData);

export default GlobalChartsDataSingleton;

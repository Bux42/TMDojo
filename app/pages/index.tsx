import React from 'react';
import { Card } from 'antd';

import InfoCard from '../components/landing/InfoCard';
import MapReplayTableWithSearchbar from '../components/landing/MapReplayTableWithSearchbar';

const Home = (): JSX.Element => (
    <div className="flex flex-col items-center min-h-screen" style={{ backgroundColor: '#1F1F1F' }}>
        <div className="flex flex-col gap-6 w-3/5 h-full py-6">
            <InfoCard />
            <div className="w-full">
                <Card>
                    <MapReplayTableWithSearchbar />
                </Card>
            </div>
        </div>
    </div>
);

export default Home;

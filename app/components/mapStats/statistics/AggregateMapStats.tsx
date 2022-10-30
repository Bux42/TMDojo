import { Col, Row, Statistic } from 'antd';
import React from 'react';
import { ReplayInfo } from '../../../lib/api/requests/replays';
import { msToTime } from '../../../lib/utils/time';

interface AggregateMapStatsProps {
    replays: ReplayInfo[];
}
const AggregateMapStats = ({ replays }: AggregateMapStatsProps) => {
    const totalRecordedTime = replays.reduce((a, b) => a + b.endRaceTime, 0);

    return (
        <Row gutter={16}>
            <Col span={12}>
                <Statistic title="Amount" value={replays ? replays.length : 0} />
            </Col>
            <Col span={12}>
                <Statistic title="Total Time" value={msToTime(totalRecordedTime)} />
            </Col>
        </Row>
    );
};

export default AggregateMapStats;

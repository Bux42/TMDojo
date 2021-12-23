import { Col, Row, Statistic } from 'antd';
import React from 'react';
import { FileResponse } from '../../lib/api/apiRequests';
import { msToTime } from '../../lib/utils/time';

interface AggregateMapStatsProps {
    replays: FileResponse[];
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

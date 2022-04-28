import React, { useMemo } from 'react';
import {
    Button, Empty, Modal, Table,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { ClockCircleOutlined, InfoCircleOutlined, QuestionOutlined } from '@ant-design/icons';
import { FileResponse } from '../../lib/api/apiRequests';
import { calcFastestSectorIndices, calcIndividualSectorTimes } from '../../lib/replays/sectorTimes';
import { getRaceTimeStr, timeDifference } from '../../lib/utils/time';

const PURPLE_SECTOR_COLOR = '#ae28ca';
const RED_SECTOR_COLOR = 'red';
const GREEN_SECTOR_COLOR = 'green';

const openInfoModal = () => {
    Modal.info({
        title: 'CP/Sector Time Table Information',
        content: (
            <div>
                {'To view sector time deltas, you need to select at least 1 replay that includes sector times. '}
                {'Replays with sector times are indicated by the  '}
                <ClockCircleOutlined />
                {'  icon in the replay list.'}
                <br />
                <br />
                White: Default color
                <br />
                <span style={{ color: 'red' }}>Red: </span>
                Sector time slower than sector time of fastest time
                <br />
                <span style={{ color: 'green' }}>Green: </span>
                Sector time faster than sector time of fastest time
                <br />
                <span style={{ color: '#ae28ca' }}>Purple: </span>
                Sector time fastest of all replays in that sector
            </div>
        ),
        width: '25%',
    });
};

interface Props {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    replays: FileResponse[];
}

const SectorTimeTableModal = ({ visible, setVisible, replays }: Props): JSX.Element => {
    const filteredReplays = useMemo(() => replays
        .filter((replay) => replay.raceFinished
            && replay.sectorTimes
            && replay.sectorTimes?.length > 0)
        .sort((a, b) => a.endRaceTime - b.endRaceTime), [replays]);

    const allIndividualSectorTimes = useMemo(
        () => filteredReplays.map((replay) => calcIndividualSectorTimes(replay.sectorTimes!, replay.endRaceTime)),
        [filteredReplays],
    );
    const fastestSectorIndices = useMemo(
        () => calcFastestSectorIndices(allIndividualSectorTimes),
        [allIndividualSectorTimes],
    );

    interface Entry {
        date: number;
        playerName: string;
        time: number;
        gap: number;
        sectorTimes: number[]
    }
    const columns: ColumnsType<Entry> = useMemo(() => [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            fixed: 'left',
            width: 150,
            render: (_, entry) => (
                timeDifference(new Date().getTime(), entry.date)
            ),
        },
        {
            title: 'Player',
            dataIndex: 'playerName',
            key: 'playerName',
            fixed: 'left',
            width: 150,
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
            fixed: 'left',
            width: 125,
            render: (_, entry) => (
                <code>
                    {getRaceTimeStr(entry.time)}
                </code>
            ),
        },
        {
            title: 'Gap',
            dataIndex: 'gap',
            key: 'gap',
            fixed: 'left',
            width: 125,
            render: (_, entry, replayIndex) => (
                <code>
                    {replayIndex === 0 ? '-' : `+${getRaceTimeStr(entry.gap)}`}
                </code>
            ),
        },
        {
            title: 'Sector Times',
            children: ((filteredReplays[0] && filteredReplays[0].sectorTimes) || []).map((_, sectorIndex) => ({
                title: `S${sectorIndex + 1}`,
                dataIndex: `sectorTimes[${sectorIndex}]`,
                key: `sectorTimes[${sectorIndex}]`,
                width: 100,
                render: (_1, entry, replayIndex) => {
                    // Get different times
                    const sectorTime = entry.sectorTimes[sectorIndex];
                    const referenceTime = allIndividualSectorTimes[0][sectorIndex];
                    const timeDiff = sectorTime - referenceTime;

                    let color = 'white';
                    if (fastestSectorIndices && fastestSectorIndices[sectorIndex] === replayIndex) {
                        // fastest sector: purple
                        color = PURPLE_SECTOR_COLOR;
                    } else if (replayIndex > 0) {
                        // delta positive/negative: red/green
                        color = timeDiff > 0 ? RED_SECTOR_COLOR : GREEN_SECTOR_COLOR;
                    }

                    // Generate string to display in cell
                    const timeStr = replayIndex === 0
                        ? getRaceTimeStr(sectorTime)
                        : `${timeDiff < 0 ? '-' : '+'}${getRaceTimeStr(Math.abs(timeDiff))}`;

                    return (
                        <code style={{ color }}>
                            {timeStr}
                        </code>
                    );
                },
            })),
        },
    ], [allIndividualSectorTimes, fastestSectorIndices, filteredReplays]);

    const dataSource = useMemo(() => {
        if (filteredReplays.length === 0) {
            return [];
        }

        // Get reference finish time from the first replay in the filteredReplays list
        const referenceFinishTime = filteredReplays[0].endRaceTime;

        const data: Entry[] = filteredReplays.map((replay, replayIndex) => ({
            date: replay.date,
            playerName: replay.playerName,
            time: replay.endRaceTime,
            gap: replay.endRaceTime - referenceFinishTime,
            sectorTimes: allIndividualSectorTimes[replayIndex],
        }));

        return data;
    }, [allIndividualSectorTimes, filteredReplays]);

    return (
        <Modal
            title={(
                <div className="flex gap-4 items-center">
                    CP/Sector Time Table
                    <Button
                        onClick={openInfoModal}
                        shape="circle"
                        icon={<QuestionOutlined />}
                    />
                </div>
            )}
            centered
            visible={visible}
            onOk={() => setVisible(false)}
            onCancel={() => setVisible(false)}
            width="80%"
            bodyStyle={{
                overflow: 'auto', margin: 0, padding: 0, paddingLeft: '16px',
            }}
        >
            {dataSource.length === 0 ? (
                <Empty
                    className="h-20"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No data to display. Select one or more replays with sector times."
                />
            ) : (
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                    size="small"
                    scroll={{ x: true }}
                />
            )}
        </Modal>
    );
};

export default SectorTimeTableModal;

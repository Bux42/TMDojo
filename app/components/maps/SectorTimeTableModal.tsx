import React, { useCallback, useMemo } from 'react';
import {
    Button, Empty, Modal, Table, Tooltip,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { ClockCircleOutlined, QuestionOutlined } from '@ant-design/icons';
import { ReplayInfo } from '../../lib/api/requests/replays';
import {
    calcFastestSectorIndices,
    calcIndividualSectorTimes,
    filterReplaysWithValidSectorTimes,
} from '../../lib/replays/sectorTimes';
import { getRaceTimeStr, timeDifference } from '../../lib/utils/time';

const PURPLE_SECTOR_COLOR = '#ae28ca';
const RED_SECTOR_COLOR = 'red';
const GREEN_SECTOR_COLOR = 'green';

const THEORETICAL_BEST_BACKGROUND_COLOR = '#141414';

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
        zIndex: 1020,
    });
};

interface Props {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    selectedReplays: ReplayInfo[];
    allReplays: ReplayInfo[];
}

const SectorTimeTableModal = ({
    visible, setVisible, selectedReplays, allReplays,
}: Props): JSX.Element => {
    const filteredReplays = useMemo(
        () => filterReplaysWithValidSectorTimes(selectedReplays, allReplays)
            .sort((a, b) => a.endRaceTime - b.endRaceTime),
        [allReplays, selectedReplays],
    );

    const allIndividualSectorTimes = useMemo(
        () => filteredReplays.map((replay) => calcIndividualSectorTimes(replay.sectorTimes!, replay.endRaceTime)),
        [filteredReplays],
    );
    const fastestSectorIndices = useMemo(
        () => calcFastestSectorIndices(allIndividualSectorTimes),
        [allIndividualSectorTimes],
    );

    interface Entry {
        date?: number;
        playerName: string;
        time: number;
        gap: number;
        sectorTimes: number[];
        replayIndex?: number;
        isTheoreticalBest?: boolean;
    }
    const columns: ColumnsType<Entry> = useMemo(() => {
        let cols: ColumnsType<Entry> = [
            {
                title: 'Date',
                dataIndex: 'date',
                key: 'date',
                fixed: 'left',
                width: 200,
                render: (_, entry) => (
                    entry.date
                        ? timeDifference(new Date().getTime(), entry.date)
                        : '-'
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
                render: (_, entry) => (
                    <code>
                        {/* Do not display Gap time for fastest replay */}
                        {entry.replayIndex === 0
                            ? '-'
                            : `${entry.gap > 0 ? '+' : ''}${getRaceTimeStr(entry.gap)}`}
                    </code>
                ),
            },
            {
                title: 'Sector Times',
                children: (allIndividualSectorTimes[0] || []).map((_, sectorIndex) => ({
                    title: () => {
                        const sectorStart = sectorIndex === 0
                            ? 'Start'
                            : `CP ${sectorIndex}`;
                        const sectorEnd = sectorIndex === allIndividualSectorTimes[0].length - 1
                            ? 'Finish'
                            : `CP ${sectorIndex + 1}`;

                        const title = `${sectorStart} ➞ ${sectorEnd}`;

                        return (
                            <Tooltip title={title} className="w-full">
                                <div className="w-full cursor-default text-center">
                                    {`S${sectorIndex + 1}`}
                                </div>
                            </Tooltip>
                        );
                    },
                    dataIndex: `sectorTimes[${sectorIndex}]`,
                    key: `sectorTimes[${sectorIndex}]`,
                    width: 75,
                    render: (_1, entry) => {
                        // Get different times
                        const sectorTime = entry.sectorTimes[sectorIndex];
                        const referenceTime = allIndividualSectorTimes[0][sectorIndex];
                        const timeDiff = sectorTime - referenceTime;

                        let color = 'white';
                        if (fastestSectorIndices[sectorIndex] === entry.replayIndex || entry.isTheoreticalBest) {
                            // fastest sector: purple
                            color = PURPLE_SECTOR_COLOR;
                        } else if (entry.replayIndex && entry.replayIndex > 0) {
                            // delta positive/negative: red/green
                            color = timeDiff > 0 ? RED_SECTOR_COLOR : GREEN_SECTOR_COLOR;
                        }

                        // Generate string to display in cell
                        const timeStr = entry.replayIndex === 0
                            ? getRaceTimeStr(sectorTime)
                            : `${timeDiff <= 0 ? '-' : '+'}${getRaceTimeStr(Math.abs(timeDiff))}`;

                        // Generate hover tooltip title
                        const tooltipTitle = getRaceTimeStr(sectorTime);

                        return (
                            <Tooltip title={tooltipTitle} placement="topLeft" className="w-full">
                                <div className="w-full cursor-default">
                                    <code style={{ color }}>
                                        {timeStr}
                                    </code>
                                </div>
                            </Tooltip>
                        );
                    },
                })),
            },
        ];

        // Set the background color of theoretical best row
        cols = cols.map((col) => ({
            ...col,
            onCell: (entry) => ({
                style: {
                    backgroundColor: entry.isTheoreticalBest ? THEORETICAL_BEST_BACKGROUND_COLOR : undefined,
                },
            }),
        }));

        return cols;
    }, [allIndividualSectorTimes, fastestSectorIndices]);

    const generateTheoreticalBestEntry = useCallback((): Entry | undefined => {
        if (allIndividualSectorTimes.length === 0) {
            return undefined;
        }

        // Retrieve best sector times from all replays
        const bestSectorTimes = allIndividualSectorTimes[0].map((_, sectorIndex) => {
            const replayIndex = fastestSectorIndices[sectorIndex];
            return allIndividualSectorTimes[replayIndex][sectorIndex];
        });

        // Calculate theoretical best time, from best sectors
        const bestTime = bestSectorTimes.reduce((a, b) => a + b, 0);

        return {
            date: undefined,
            playerName: 'Theoretical Best',
            time: bestTime,
            gap: bestTime - filteredReplays[0].endRaceTime,
            sectorTimes: bestSectorTimes,
            isTheoreticalBest: true,
        };
    }, [allIndividualSectorTimes, fastestSectorIndices, filteredReplays]);

    const dataSource = useMemo(() => {
        if (filteredReplays.length === 0) {
            return [];
        }

        // Get reference finish time from the first replay in the filteredReplays list
        const referenceFinishTime = filteredReplays[0].endRaceTime;

        let data: Entry[] = filteredReplays.map((replay, replayIndex) => ({
            date: replay.date,
            playerName: replay.playerName,
            time: replay.endRaceTime,
            gap: replay.endRaceTime - referenceFinishTime,
            sectorTimes: allIndividualSectorTimes[replayIndex],
            replayIndex,
        }));

        const theoreticalBest = generateTheoreticalBestEntry();
        if (theoreticalBest) {
            data = [theoreticalBest, ...data];
        }

        return data;
    }, [allIndividualSectorTimes, filteredReplays, generateTheoreticalBestEntry]);

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
            footer={null}
            onOk={() => setVisible(false)}
            onCancel={() => setVisible(false)}
            width="80%"
            zIndex={1010} // 1000 is default for Drawer components
            style={{
                maxHeight: '80%',
            }}
            bodyStyle={{
                overflow: 'auto',
                margin: 0,
                padding: 0,
                paddingLeft: '16px',
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
                    onRow={(entry) => ({
                        style: {
                            backgroundColor: entry.isTheoreticalBest ? THEORETICAL_BEST_BACKGROUND_COLOR : undefined,
                        },
                    })}
                    pagination={false}
                    size="small"
                    scroll={{ x: true, y: '50vh' }}
                />
            )}
        </Modal>
    );
};

export default SectorTimeTableModal;

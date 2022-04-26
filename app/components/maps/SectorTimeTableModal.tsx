import React, { useMemo } from 'react';
import {
    Button, Empty, Modal, Table,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { ClockCircleOutlined, InfoCircleOutlined, QuestionOutlined } from '@ant-design/icons';
import { FileResponse } from '../../lib/api/apiRequests';
import { calcFastestSectorIndices, calcIndividualSectorTimes } from '../../lib/replays/sectorTimes';
import { getRaceTimeStr, timeDifference } from '../../lib/utils/time';

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
        date: string;
        player: string;
        time: string;
        gap: string;
        // all sector time columns excluded
    }
    const columns = useMemo(() => {
        const generatedColumns: ColumnsType<Entry> = [
            {
                title: 'Date',
                dataIndex: 'date',
                key: 'date',
                fixed: 'left',
                width: 150,
            },
            {
                title: 'Player',
                dataIndex: 'player',
                key: 'player',
                fixed: 'left',
                width: 150,
            },
            {
                title: 'Time',
                dataIndex: 'time',
                key: 'time',
                fixed: 'left',
                width: 125,
                render: (text) => (<code>{text}</code>),
            },
            {
                title: 'Gap',
                dataIndex: 'gap',
                key: 'gap',
                fixed: 'left',
                width: 125,
                render: (text) => (<code>{text}</code>),
            },
        ];

        if (filteredReplays.length > 0 && filteredReplays[0].sectorTimes) {
            const numSectors = filteredReplays[0].sectorTimes.length;
            for (let i = 0; i < numSectors + 1; i++) {
                generatedColumns.push({
                    title: `S${i + 1}`,
                    dataIndex: `sector${i + 1}`,
                    key: `sector${i + 1}`,
                    render: (text, _, replayIndex) => {
                        let color = '';
                        if (fastestSectorIndices && fastestSectorIndices[i] === replayIndex) {
                            // fastest sector: purple
                            color = '#ae28ca';
                        } else if (replayIndex > 0) {
                            // delta positive/negative: red/green
                            color = text.includes('+') ? 'red' : 'green';
                        }

                        return (
                            <code style={{ color }}>
                                {text}
                            </code>
                        );

                        // Placeholder for when absolute time toggle is implemented:
                        // return (
                        //     <code style={{ color }}>
                        //         {getRaceTimeStr(allIndividualSectorTimes[replayIndex][i])}
                        //     </code>
                        // );
                    },
                });
            }
        }
        return generatedColumns;
    }, [fastestSectorIndices, filteredReplays]);

    const dataSource = useMemo(() => {
        if (filteredReplays.length === 0) {
            return [];
        }

        // Get reference finish time from the first replay in the filteredReplays list
        const referenceFinishTime = filteredReplays[0].endRaceTime;

        const data: Entry[] = filteredReplays.map((replay, replayIndex) => {
            const entry: any = {};

            const now = new Date().getTime();
            entry.date = timeDifference(now, replay.date);
            entry.player = replay.playerName;
            entry.time = getRaceTimeStr(replay.endRaceTime);

            // Set gap time of first replay to '-', and to '+gap' for all other replays
            entry.gap = replayIndex === 0
                ? '-'
                : `+${getRaceTimeStr(replay.endRaceTime - referenceFinishTime)}`;

            // Set all sector times
            const individualSectorTimes = allIndividualSectorTimes[replayIndex];
            if (individualSectorTimes) {
                for (let i = 0; i < individualSectorTimes.length; i++) {
                    const individualSectorTime = individualSectorTimes[i];
                    if (replayIndex === 0) {
                        // First replay: always display the absolute sector time
                        entry[`sector${i + 1}`] = getRaceTimeStr(individualSectorTime);
                    } else {
                        // Other replays: display the delta to the sectors of the fastest replay
                        const referenceTime = allIndividualSectorTimes[0][i];

                        const timeDiff = individualSectorTime - referenceTime;
                        const sign = timeDiff < 0 ? '-' : '+';

                        entry[`sector${i + 1}`] = `${sign}${getRaceTimeStr(Math.abs(timeDiff))}`;
                    }
                }
            }

            return entry;
        });
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

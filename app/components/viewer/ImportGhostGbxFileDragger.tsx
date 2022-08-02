import { UploadOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import Dragger from 'antd/lib/upload/Dragger';
import { UploadFile } from 'antd/lib/upload/interface';
import axios from 'axios';
import { ReplayData } from '../../lib/api/apiRequests';
import { readDataView } from '../../lib/replays/replayData';

interface Props {
    onReplayLoaded: (replay: ReplayData) => void;
}

const ImportGhostGbxFileDragger = ({ onReplayLoaded }: Props): JSX.Element => {
    const fetchGhostGbxDataBuffer = async (file: UploadFile) => {
        if (file.originFileObj !== undefined) {
            const formData = new FormData();
            formData.append('file', file.originFileObj, file.name);

            const res = await axios.post(
                'https://localhost:7017/api/replay/ghostgbx',
                formData,
                { responseType: 'arraybuffer' },
            );

            const dataView = new DataView(res.data);
            const {
                samples, minPos, maxPos, dnfPos, color, intervalMedian,
            } = readDataView(dataView);

            const replay: ReplayData = {
                samples,
                minPos,
                maxPos,
                dnfPos,
                color,
                intervalMedian,
                authorName: 'Imported from Ghost GBX',
                mapUId: 'mapUId',
                date: 1,
                endRaceTime: 32116,
                mapName: 'mapName',
                playerName: 'playerName',
                playerLogin: 'playerLogin',
                raceFinished: 1,
                webId: 'webId',
                _id: '_id',
            };

            onReplayLoaded(replay);
        }
    };

    const onUploadChange = async (info: any) => {
        const { status } = info.file;

        if (status === 'done') {
            try {
                await fetchGhostGbxDataBuffer(info.file);
                message.success(`${info.file.name} file uploaded successfully.`);
            } catch (e) {
                console.log(e);
                message.error(`${info.file.name} file parsing failed.`);
            }
        } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    };

    return (
        <Dragger
            onChange={onUploadChange}
            showUploadList={false}
        >
            <Button icon={<UploadOutlined />}>
                Upload
                {' '}
                <code>.Ghost.Gbx</code>
            </Button>
        </Dragger>
    );
};

export default ImportGhostGbxFileDragger;

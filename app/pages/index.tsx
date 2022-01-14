import CleanButton from '../components/common/CleanButton';
import UserDisplay from '../components/common/UserDisplay';
import ExplanationInfo from '../components/landing/ExplanationInfo';
import MapReplayTableWithSearchbar from '../components/landing/MapReplayTableWithSearchbar';

const DISCORD_URL = 'https://discord.gg/RPbZHvxNRG';
const SPONSOR_URL = 'https://github.com/sponsors/tm-dojo';

const Home = (): JSX.Element => (
    <div className="flex flex-col items-center min-h-screen bg-gray-850">
        <div
            className="sticky top-0 z-10 flex flex-row justify-between w-full h-20 shadow-md bg-gray-750"
        >
            <div className="flex-grow pl-10" />
            <div className="flex flex-row gap-4 place-self-center items-center">
                <img
                    src="/images/tmdojo_logo.png"
                    className="h-10 w-10 object-cover drop-shadow-sm"
                    alt="TMDojo Logo"
                />
                <span className="text-3xl font-bold">TMDojo</span>
            </div>
            <div className="flex flex-grow items-center justify-end w-0 pr-10">
                <UserDisplay />
            </div>
        </div>

        <div className="flex flex-col w-2/3 mt-20">
            <div className="flex flex-row gap-8">
                <div
                    className="flex flex-col w-3/4 pt-4 pb-6 px-8 rounded-md gap-6 bg-gray-750"
                >
                    <ExplanationInfo />
                </div>

                <div
                    className="flex flex-col flex-grow items-center
                        justify-center gap-10 rounded-md py-12 px-4 bg-gray-750"
                >
                    <div className="flex flex-col items-center gap-4 text-base font-semibold">
                        <span className="flex flex-col text-center">
                            Want more information?
                            <br />
                            Join our Discord!
                            <br />
                        </span>
                        <CleanButton size="large" color="#5865F2" url={DISCORD_URL} openInNewTab>
                            <img
                                src="/images/discord_icon.svg"
                                width={18}
                                height={18}
                                alt="Discord Icon"
                            />
                            Discord
                        </CleanButton>
                    </div>
                    <div className="flex flex-col items-center gap-4 text-base font-semibold">
                        <span className="flex flex-col text-center">
                            Want to support development?
                            <br />
                            Sponsor us on GitHub!
                            <br />
                        </span>
                        <CleanButton size="large" color="#C96198" url={SPONSOR_URL} openInNewTab>
                            <img
                                src="/images/github_sponsor_icon.svg"
                                width={18}
                                height={18}
                                alt="Discord Icon"
                            />
                            Sponsor
                        </CleanButton>
                    </div>
                </div>
            </div>

            <div
                className="flex flex-col gap-8 w-full mt-10 p-6 rounded-md bg-gray-750"
            >
                <div className="self-center text-2xl font-bold">
                    Maps
                </div>
                <MapReplayTableWithSearchbar />
            </div>
        </div>

        <div
            className="flex flex-row mt-20 px-10 items-center justify-end w-full h-20 shadow-md bg-gray-750"
        >
            <div className="flex flex-row gap-3 items-center">
                <img
                    src="/images/tmdojo_logo.png"
                    className="h-8 w-8 object-cover drop-shadow-sm"
                    alt="TMDojo Logo"
                />
                <span className="text-xl font-bold">TMDojo</span>
            </div>
        </div>
    </div>
);

export default Home;

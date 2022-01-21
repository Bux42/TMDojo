import CleanButton from '../components/common/CleanButton';
import Footer from '../components/common/Footer';
import UserDisplay from '../components/common/UserDisplay';
import ExplanationInfo from '../components/landing/ExplanationInfo';
import MapReplayTableWithSearchbar from '../components/landing/MapReplayTableWithSearchbar';

const DISCORD_URL = 'https://discord.gg/RPbZHvxNRG';
const SPONSOR_URL = 'https://github.com/sponsors/tm-dojo';

const Home = (): JSX.Element => (
    <div className="flex flex-col items-center min-h-screen bg-gray-850">
        <div
            className="lg:sticky top-0 z-10
                flex flex-col lg:flex-row items-center lg:justify-between gap-4 lg:gap-0
                w-full lg:h-20 h-full
                py-4 lg:py-0 mb-10 lg:mb-20
                shadow-md bg-gray-750"
        >
            <div className="flex-grow pl-10 hidden lg:block" />
            <div className="flex flex-row gap-4 place-self-center items-center lg:pb-0">
                <img
                    src="/images/tmdojo_logo.png"
                    className="h-10 w-10 object-cover drop-shadow-sm"
                    alt="TMDojo Logo"
                />
                <span className="text-3xl font-bold">TMDojo</span>
            </div>
            <div className="flex flex-grow items-center justify-end lg:w-0 lg:pr-10">
                <UserDisplay />
            </div>
        </div>

        <div className="flex flex-col w-full lg:w-4/5 xl:w-2/3">
            <div className="flex flex-col md:flex-row gap-8">
                <div
                    className="flex flex-col w-full md:w-3/4 pt-4 pb-6 px-4 sm:px-8 rounded-md gap-6 bg-gray-750"
                >
                    <ExplanationInfo />
                </div>

                <div
                    className="flex md:flex-col flex-grow items-center
                        justify-center gap-10 rounded-md py-6 md:py-12 px-4 bg-gray-750"
                >
                    <div className="flex flex-col items-center gap-4 text-sm md:text-base font-semibold">
                        <span className="flex flex-col text-center">
                            Want more information?
                            <br />
                            Join our Discord!
                            <br />
                        </span>
                        <CleanButton
                            size="large"
                            backColor="#5865F2"
                            url={DISCORD_URL}
                            openInNewTab
                            darkenOnHover={false}
                        >
                            <img
                                src="/images/discord_icon.svg"
                                width={18}
                                height={18}
                                alt="Discord Icon"
                            />
                            Discord
                        </CleanButton>
                    </div>
                    <div className="flex flex-col items-center gap-4 text-sm md:text-base font-semibold">
                        <span className="flex flex-col text-center">
                            Want to support development?
                            <br />
                            Sponsor us on GitHub!
                            <br />
                        </span>
                        <CleanButton
                            size="large"
                            backColor="#C96198"
                            url={SPONSOR_URL}
                            openInNewTab
                            darkenOnHover={false}
                        >
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
                className="flex flex-col gap-8 w-full mt-10 px-2 py-6 md:px-6 rounded-md bg-gray-750"
            >
                <div className="self-center text-2xl font-bold">
                    Maps
                </div>
                <MapReplayTableWithSearchbar />
            </div>
        </div>

        <Footer />
    </div>
);

export default Home;

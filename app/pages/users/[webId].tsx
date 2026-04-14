import React, { useContext, useMemo } from 'react';
import { useRouter } from 'next/router';

import { Switch, Tooltip } from 'antd';
import Link from 'antd/lib/typography/Link';
import useUserInfo from '../../lib/api/reactQuery/hooks/query/users';

import HeadTitle from '../../components/common/HeadTitle';
import UserReplays from '../../components/users/UserReplays';
import PageHeaderBar from '../../components/common/PageHeaderBar';
import Footer from '../../components/common/Footer';
import PageContainer from '../../components/containers/PageContainer';
import useSetUserPrivateReplays from '../../lib/api/reactQuery/hooks/mutations/users';
import { AuthContext } from '../../lib/contexts/AuthContext';

const Home = (): JSX.Element => {
    const router = useRouter();
    const { webId } = router.query;
    const routeWebId = typeof webId === 'string' ? webId : undefined;

    const { user } = useContext(AuthContext);
    const { data: userInfo } = useUserInfo(routeWebId);

    const isCurrentUser = Boolean(
        user && routeWebId && user.accountId === routeWebId,
    );

    const {
        mutateAsync: setUserPrivateReplays,
        isPending: isTogglingPrivateReplays,
    } = useSetUserPrivateReplays(userInfo?.webId || '');

    const title = useMemo(
        () => (userInfo ? `${userInfo.playerName} - TMDojo` : 'TMDojo'),
        [userInfo],
    );

    const onPrivateReplaysSwitchChange = async (
        checked: boolean,
    ): Promise<void> => {
        if (!userInfo?.webId || !isCurrentUser) {
            return;
        }

        await setUserPrivateReplays(checked);
    };

    return (
        <div className="flex flex-col items-center min-h-screen w-full bg-page-back">
            <HeadTitle title={title} />
            <PageHeaderBar
                title={userInfo?.playerName || ''}
                backUrl="/"
            />

            <PageContainer>
                <div className="w-full mb-8 bg-gray-750 rounded-md p-8 text-center">
                    <span className="text-small">User profile of:</span>
                    <br />
                    <span className="text-2xl font-bold">
                        <Link
                            href={`https://trackmania.io/#/player/${userInfo?.webId}`}
                            target="_blank"
                        >
                            {userInfo?.playerName}
                        </Link>
                    </span>
                    <br />
                    <span className="text-small">
                        Joined{' '}
                        {new Date(
                            userInfo?.createdAt || 0,
                        ).toLocaleDateString()}
                    </span>
                </div>

                {isCurrentUser && (
                    <div className="w-full p-8 bg-gray-750 rounded-md gap-4 flex flex-col mb-8">
                        <span className="text-2xl font-bold">Settings</span>
                        <div className="w-full bg-gray-750 rounded-md gap-4 flex flex-row">
                            <span className="text-small">Private replays</span>
                            <Tooltip title="When enabled, your replays will only be visible to you.">
                                <Switch
                                    title="Private replays"
                                    checked={Boolean(userInfo?.privateReplays)}
                                    onChange={onPrivateReplaysSwitchChange}
                                    loading={isTogglingPrivateReplays}
                                />
                            </Tooltip>
                        </div>
                    </div>
                )}
                {userInfo && (
                    <div className="w-full p-8 bg-gray-750 rounded-md">
                        <UserReplays userInfo={userInfo} />
                    </div>
                )}
            </PageContainer>

            <Footer />
        </div>
    );
};

export default Home;

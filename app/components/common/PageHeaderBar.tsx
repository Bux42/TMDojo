import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import React from 'react';
import UserDisplay from './UserDisplay';

interface PageHeaderBarProps {
    title: string,
    subtitle?: string,
    backUrl?: string,
    children?: React.ReactNode
}
const PageHeaderBar = ({
    title, subtitle, children, backUrl,
}: PageHeaderBarProps) => {
    const router = useRouter();

    const onBack = () => {
        if (backUrl) {
            router.push(backUrl);
        } else {
            router.back();
        }
    };

    return (
        <div
            className="md:sticky z-50 top-0 flex flex-col md:flex-row items-center justify-between w-full min-h-20
            p-6 shadow-md bg-gray-750 gap-4"
        >
            <div className="flex flex-col lg:flex-row flex-grow gap-4 items-center md:items-baseline">
                <div className="flex gap-4 items-baseline">
                    <Button
                        icon={<ArrowLeftOutlined className="text-base" />}
                        type="text"
                        onClick={onBack}
                    />

                    <div className="flex flex-wrap gap-4 items-baseline">
                        <span className="text-xl font-bold">
                            {title}
                        </span>
                        {subtitle && (
                            <span className="text-gray-400">
                                {subtitle}
                            </span>
                        )}
                    </div>

                </div>

                <div className="flex flex-wrap justify-center gap-4">
                    {children}
                </div>
            </div>

            <div className="flex items-center justify-end">
                <UserDisplay />
            </div>
        </div>
    );
};

export default PageHeaderBar;

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import React from 'react';
import UserDisplay from './UserDisplay';

interface PageHeaderBarProps {
    title: string,
    children?: React.ReactNode
}
const PageHeaderBar = ({ title, children } : PageHeaderBarProps) => {
    const router = useRouter();

    return (
        <div
            className="sticky z-50 top-0 flex flex-row items-center justify-between w-full h-20
            p-10 shadow-md bg-gray-750"
        >
            <div className="flex flex-row flex-grow gap-4 items-baseline">
                <Button
                    icon={<ArrowLeftOutlined className="text-base" />}
                    type="text"
                    onClick={() => router.back()}
                />

                <span className="text-xl font-bold">
                    {title}
                </span>

                {children}
            </div>

            <div className="flex items-center justify-end w-0">
                <UserDisplay />
            </div>
        </div>
    );
};

export default PageHeaderBar;

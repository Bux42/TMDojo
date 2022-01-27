import React from 'react';

interface Props {
    children: React.ReactNode;
}

const PageContainer = ({ children }: Props) => (
    <div className="flex flex-col flex-grow w-full lg:w-4/5 xl:w-2/3 mt-10 lg:mt-20">
        {children}
    </div>
);

export default PageContainer;

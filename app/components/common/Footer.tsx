import React from 'react';

const Footer = () => (
    <div
        className="flex flex-row mt-10 lg:mt-20 px-10 items-center justify-end w-full h-20 shadow-md bg-gray-750"
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
);

export default Footer;

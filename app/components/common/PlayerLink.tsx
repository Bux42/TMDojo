import Link from 'next/link';
import React from 'react';

const ABSOLUTE_USERS_PATH = '/users';

interface PlayerLinkProps {
    webId: string;
    name: string;
    className?: string;
    style?: React.CSSProperties
}
const PlayerLink = ({
    webId, name, className, style,
}: PlayerLinkProps) => (
    <Link href={`${ABSOLUTE_USERS_PATH}/${webId}`}>
        <a
            target="_blank"
            rel="noreferrer"
            href={`${ABSOLUTE_USERS_PATH}/${webId}`}
            className={className}
            style={style}
        >
            {name}
        </a>
    </Link>
);

export default PlayerLink;

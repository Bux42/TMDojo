interface SkipInput {
    limit?: number;
    skip?: number;
    skipPage?: number;
}

export const calculateSkip = ({ limit, skip, skipPage }: SkipInput): number | undefined => {
    if (skipPage !== undefined && limit !== undefined) {
        return skipPage * limit;
    }

    if (skip !== undefined) {
        return skip;
    }

    return undefined;
};
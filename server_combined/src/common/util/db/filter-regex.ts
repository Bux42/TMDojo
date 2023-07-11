export const regexPartialLowercaseStr = (search: string) => (
    { $regex: `^.*${search}.*$`, $options: 'i' }
);

// TODO: remove this workaround once we have more than one export here
// eslint-disable-next-line import/prefer-default-export
export const cleanTMFormatting = (formattedString: string): string => {
    // reference: https://regex101.com/r/WiQPUG/6 by Solux
    const tmRegex = new RegExp(
        /(?<!\$)((?<d>\$+)\k<d>)?((?<=\$)(?!\$)|(\$([a-f\d]{1,3}|[ionmwsztg<>]|[lhp](\[[^\]]+\])?)))/gim,
    );
    return formattedString.replace(tmRegex, '');
};

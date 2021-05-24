export const cleanTMFormatting = (formattedString: string): string => {
    // reference: https://regex101.com/r/WiQPUG/6 by Solux
    const tmRegex = new RegExp(
        /(?<!\$)((?<d>\$+)\k<d>)?((?<=\$)(?!\$)|(\$([a-f\d]{1,3}|[ionmwsztg<>]|[lhp](\[[^\]]+\])?)))/gim
    );
    return formattedString.replace(tmRegex, "");
};

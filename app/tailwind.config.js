const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                gray: {
                    750: '#2C2C2C',
                    850: '#1F1F1F',
                },
            },
        },
        colors: {
            ...colors,
            gray: colors.trueGray,
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};

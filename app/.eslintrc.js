module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'plugin:react/recommended',
        'airbnb',
        'plugin:react-hooks/recommended',
    ],
    globals: {
        React: true,
        JSX: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['react', '@typescript-eslint'],
    rules: {
        // indentation rules
        indent: ['error', 4],
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        // project structure
        'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never',
                jsx: 'never',
                ts: 'never',
                tsx: 'never',
            },
        ],
        // TS-enforced stuff that only leads to false positives
        'no-param-reassign': 'off',
        'no-use-before-define': 'off',
        'no-unused-vars': 'off',
        'react/require-default-props': 'off',
        // due to DB IDs we have to disable this
        'no-underscore-dangle': 'off',
        camelcase: ['error', {
            allow: ['redirect_uri', 'client_id', 'response_type'],
        }],
        // preferences
        '@typescript-eslint/no-use-before-define': 'off',
        'no-plusplus': 'off',
        'max-len': ['error', 120],
        'lines-between-class-members': 'off',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
};

module.exports = {
    env: {
        node: true,
        commonjs: true,
        es2021: true,
    },
    extends: [
        'airbnb-base',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        // indentation rules
        indent: ['error', 4],
        // due to DB IDs we have to disable this
        'no-underscore-dangle': 'off',
        // preferences
        'no-plusplus': 'off',
        'max-len': ['error', 120],
        'lines-between-class-members': 'off',
        // TODO: enforce this again when we have a proper logger
        'no-console': 'off',
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
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
};

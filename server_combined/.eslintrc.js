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
        // TS-enforced stuff that only leads to false positives
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        // preferences
        'no-plusplus': 'off',
        'max-len': ['error', 120],
        'lines-between-class-members': 'off',
        'no-console': 'error',
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
        // Additions after NestJS
        'import/prefer-default-export': 'off',
        'no-useless-constructor': 'off',
        'class-methods-use-this': 'off',
        'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.spec.ts', '**/*.e2e-spec.ts'] }],
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
};

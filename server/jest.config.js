module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverageFrom: [
        'src/**',
    ],
    coveragePathIgnorePatterns: [
        // add patterns to ignore here
    ],
};

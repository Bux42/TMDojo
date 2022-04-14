module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: 'src/.*\\.spec\\.ts$',
    collectCoverageFrom: [
        'src/**/*.(t|j)s',
    ],
    coveragePathIgnorePatterns: [
        // add patterns to ignore here
    ],
    moduleDirectories: [
        'node_modules',
        'src',
    ],
};

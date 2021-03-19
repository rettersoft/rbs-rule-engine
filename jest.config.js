"use strict";

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  testEnvironment: "node",
  preset: "ts-jest",
};

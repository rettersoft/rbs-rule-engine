"use strict";

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 70,
      lines: 90,
      statements: 80,
    },
  },
  testEnvironment: "node",
  preset: "ts-jest",
};

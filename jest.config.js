"use strict";

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 90,
      statements: 70,
    },
  },
  testEnvironment: "node",
  preset: "ts-jest",
};

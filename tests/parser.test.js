
const assert = require('assert');
const path = require('path');
const { parseCoverage: parse } = require('../src/parser.js');

const testFilePath = path.join(__dirname, 'coverage.txt');

const expected = {
  totalCoverage: 66.66666666666666,
  packageCoverage: {
    'github.com/owner/repo/package1': 50,
    'github.com/owner/repo/package2': 100
  }
};

const result = parse(testFilePath);

assert.deepStrictEqual(result, expected);

console.log('Test passed!');


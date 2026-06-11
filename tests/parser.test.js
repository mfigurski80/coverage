import {describe, it, expect, beforeAll, afterAll} from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCoverage } from '../src/parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('parseCoverage', () => {
  const testFilePath = path.join(__dirname, 'coverage.txt');

  beforeAll(() => {
    const dummyCoverage = `mode: set
github.com/owner/repo/package1/file1.go:10.5,12.5 1 0
github.com/owner/repo/package1/file2.go:15.1,17.2 2 1
github.com/owner/repo/package2/file3.go:8.1,10.2 1 1
`;
    fs.writeFileSync(testFilePath, dummyCoverage);
  });

  afterAll(() => {
    fs.unlinkSync(testFilePath);
  });

  it('should parse coverage.txt and return statement counts', () => {
    const result = parseCoverage(testFilePath);

    expect(result.totalStatements).toBe(4);
    expect(result.totalCoveredStatements).toBe(3);
    expect(result.packageCoverage['github.com/owner/repo/package1']).toEqual({ totalStatements: 3, coveredStatements: 2 });
    expect(result.packageCoverage['github.com/owner/repo/package2']).toEqual({ totalStatements: 1, coveredStatements: 1 });
  });
});
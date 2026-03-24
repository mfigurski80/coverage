const fs = require('fs');
const path = require('path');
const { parseCoverage } = require('../src/parser');

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

  it('should parse coverage.txt and calculate coverage percentages', () => {
    const result = parseCoverage(testFilePath);

    const expected = {
      totalCoverage: 75,
      packageCoverage: {
        'github.com/owner/repo/package1': 66.66666666666666,
        'github.com/owner/repo/package2': 100,
      },
    };

    expect(result.totalCoverage).toBeCloseTo(expected.totalCoverage);
    expect(result.packageCoverage['github.com/owner/repo/package1']).toBeCloseTo(expected.packageCoverage['github.com/owner/repo/package1']);
    expect(result.packageCoverage['github.com/owner/repo/package2']).toBeCloseTo(expected.packageCoverage['github.com/owner/repo/package2']);
  });
});
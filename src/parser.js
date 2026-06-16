
import fs from 'fs';
import path from 'path';

export function parseCoverage(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');

  let totalStatements = 0;
  let totalCoveredStatements = 0;
  const packageCoverage = {};

  for (const line of lines) {
    if (line.startsWith('mode:') || line.trim() === '') {
      continue;
    }

    const parts = line.split(' ');
    const filePathAndPosition = parts[0];
    const numStatements = parseInt(parts[1], 10);
    const count = parseInt(parts[2], 10);

    const filePathString = filePathAndPosition.substring(0, filePathAndPosition.lastIndexOf(':'));
    const packageName = path.dirname(filePathString);

    if (!packageCoverage[packageName]) {
      packageCoverage[packageName] = {
        totalStatements: 0,
        coveredStatements: 0,
      };
    }

    packageCoverage[packageName].totalStatements += numStatements;
    totalStatements += numStatements;

    if (count > 0) {
      packageCoverage[packageName].coveredStatements += numStatements;
      totalCoveredStatements += numStatements;
    }
  }

  return {
    totalStatements,
    totalCoveredStatements,
    packageCoverage,
  };
}

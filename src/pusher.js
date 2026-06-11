import axios from 'axios';

function fmtLabelPath(labels) {
  if (!labels || !Object.keys(labels).length) return '';

  return '/' + Object.entries(labels)
    .map(([key, value]) => `${key}/${value}`)
    .join('/')
}

export async function pushMetrics(prometheusEndpoint, jobName, coverageData, labels) {
  const { totalStatements, totalCoveredStatements, packageCoverage } = coverageData;

  let metrics = `# TYPE go_test_coverage_statements gauge\n`;
  metrics += `go_test_coverage_statements ${totalStatements}\n`;
  metrics += `# TYPE go_test_coverage_covered_statements gauge\n`;
  metrics += `go_test_coverage_covered_statements ${totalCoveredStatements}\n`;
  metrics += `# TYPE go_test_coverage_package_statements gauge\n`;
  metrics += `# TYPE go_test_coverage_package_covered_statements gauge\n`;

  for (const pkgName in packageCoverage) {
    const { totalStatements: pkgTotal, coveredStatements: pkgCovered } = packageCoverage[pkgName];
    metrics += `go_test_coverage_package_statements{package="${pkgName}"} ${pkgTotal}\n`;
    metrics += `go_test_coverage_package_covered_statements{package="${pkgName}"} ${pkgCovered}\n`;
  }

  const url = `${prometheusEndpoint}/metrics/job/${jobName}${fmtLabelPath(labels)}`;

  try {
    await axios.post(url, metrics, { headers: { 'Content-Type': 'text/plain' } });
    console.log('Successfully pushed metrics to Prometheus Pushgateway.');
  } catch (err) {
    console.error('Error pushing metrics to Prometheus Pushgateway:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
      console.error('Response status:', err.response.status);
    }
    throw err;
  }
}

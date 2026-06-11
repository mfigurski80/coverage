import axios from 'axios';

function fmtLabelPath(labels) {
  if (!labels || !Object.keys(labels).length) return '';

  return '/' + Object.entries(labels)
    .map(([key, value]) => `${key}/${value}`)
    .join('/')
}

export async function pushMetrics(prometheusEndpoint, jobName, coverageData, labels) {
  const { totalCoverage, packageCoverage } = coverageData;

  let metrics = `# TYPE go_test_coverage_percentage gauge\n`;
  metrics += `go_test_coverage_percentage ${totalCoverage}\n`;
  metrics += `# TYPE go_test_coverage_package_percentage gauge\n`;

  for (const pkgName in packageCoverage) {
    const pkgCoverage = packageCoverage[pkgName];
    metrics += `go_test_coverage_package_percentage{package="${pkgName}"} ${pkgCoverage}\n`;
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

import axios from 'axios';

function formatLabels(labels) {
  return Object.entries(labels)
    .map(([key, value]) => `${key}="${value}"`)
    .join(',');
}

export async function pushMetrics(prometheusEndpoint, jobName, coverageData, labels) {
  const { totalCoverage, packageCoverage } = coverageData;

  let metrics = `# TYPE go_test_coverage_percentage gauge\n`;
  metrics += `go_test_coverage_percentage{job="${jobName}", ${formatLabels(labels)}} ${totalCoverage}\n`;
  metrics += `# TYPE go_test_coverage_package_percentage gauge\n`;

  for (const pkgName in packageCoverage) {
    const pkgCoverage = packageCoverage[pkgName];
    const pkgLabels = { ...labels, package: pkgName };
    metrics += `go_test_coverage_package_percentage{job="${jobName}", ${formatLabels(pkgLabels)}} ${pkgCoverage}\n`;
  }

  const url = `${prometheusEndpoint}/metrics/job/${jobName}`;

  await axios.post(url, metrics, {
    headers: { 'Content-Type': 'text/plain' },
  }).then(() => {
    console.log('Successfully pushed metrics to Prometheus Pushgateway.');
  }).catch((error) => {
    console.error('Error pushing metrics to Prometheus Pushgateway:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  });
}

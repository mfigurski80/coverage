const axios = require('axios');

/**
 * Pushes coverage data to a Prometheus Pushgateway.
 *
 * @param {string} prometheusEndpoint The URL of the Prometheus Pushgateway.
 * @param {string} jobName The name of the job.
 * @param {object} coverageData The coverage data object.
 * @param {object} labels An object of additional labels.
 */
module.exports = async function pushMetrics(prometheusEndpoint, jobName, coverageData, labels) {
  const { lines, statements, functions, branches } = coverageData;

  const metrics = `
# TYPE coverage_lines gauge
coverage_lines{job="${jobName}", ${formatLabels(labels)}} ${lines.percentage}
# TYPE coverage_statements gauge
coverage_statements{job="${jobName}", ${formatLabels(labels)}} ${statements.percentage}
# TYPE coverage_functions gauge
coverage_functions{job="${jobName}", ${formatLabels(labels)}} ${functions.percentage}
# TYPE coverage_branches gauge
coverage_branches{job="${jobName}", ${formatLabels(labels)}} ${branches.percentage}
  `;

  const url = `${prometheusEndpoint}/metrics/job/${jobName}`;

  try {
    await axios.post(url, metrics, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    console.log('Successfully pushed metrics to Prometheus Pushgateway.');
  } catch (error) {
    console.error('Error pushing metrics to Prometheus Pushgateway:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
};

/**
 * Formats an object of labels into a Prometheus-compatible string.
 *
 * @param {object} labels The labels object.
 * @returns {string} The formatted labels string.
 */
function formatLabels(labels) {
  return Object.entries(labels)
    .map(([key, value]) => `${key}="${value}"`)
    .join(',');
}

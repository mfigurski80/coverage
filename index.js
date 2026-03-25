const path = require('path');
const { parseCoverage } = require('./src/parser.js');
const pushMetrics = require('./src/pusher.js');

async function run() {
  try {
    const core = await import('@actions/core');
    const github = await import('@actions/github');
    const prometheusEndpoint = core.getInput('prometheus_endpoint', { required: true });
    const labelsStr = core.getInput('labels');
    const coverageFilePath = path.join(process.env.GITHUB_WORKSPACE, 'coverage.txt');

    const coverageData = parseCoverage(coverageFilePath);

    const labels = {};
    if (labelsStr) {
      for (const label of labelsStr.split(',')) {
        const [key, value] = label.split('=');
        labels[key.trim()] = value.trim();
      }
    }

    const jobName = github.context.job;

    await pushMetrics(prometheusEndpoint, jobName, coverageData, labels);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

import * as core from '@actions/core';
import * as github from '@actions/github';
import path from 'path';
import { parseCoverage } from './src/parser.js';
import { pushMetrics } from './src/pusher.js';

async function run() {
  try {
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

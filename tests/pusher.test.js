
const assert = require('assert');
const sinon = require('sinon');
const axios = require('axios');
const pushMetrics = require('../src/pusher.js');

async function runTest() {
  const axiosPostStub = sinon.stub(axios, 'post');

  const prometheusEndpoint = 'http://localhost:9091';
  const jobName = 'test-job';
  const coverageData = {
    lines: { percentage: 80 },
    statements: { percentage: 85 },
    functions: { percentage: 90 },
    branches: { percentage: 75 },
  };
  const labels = {
    branch: 'main',
    commit: 'abc1234',
  };

  const expectedMetrics = `
# TYPE coverage_lines gauge
coverage_lines{job="test-job", branch="main",commit="abc1234"} 80
# TYPE coverage_statements gauge
coverage_statements{job="test-job", branch="main",commit="abc1234"} 85
# TYPE coverage_functions gauge
coverage_functions{job="test-job", branch="main",commit="abc1234"} 90
# TYPE coverage_branches gauge
coverage_branches{job="test-job", branch="main",commit="abc1234"} 75
  `;
  const expectedUrl = 'http://localhost:9091/metrics/job/test-job';

  try {
    await pushMetrics(prometheusEndpoint, jobName, coverageData, labels);

    assert.ok(axiosPostStub.calledOnce, 'axios.post should be called once');
    assert.strictEqual(axiosPostStub.getCall(0).args[0], expectedUrl, 'axios.post should be called with the correct URL');
    assert.strictEqual(axiosPostStub.getCall(0).args[1], expectedMetrics, 'axios.post should be called with the correct metrics data');
    assert.deepStrictEqual(axiosPostStub.getCall(0).args[2], {
      headers: {
        'Content-Type': 'text/plain',
      },
    }, 'axios.post should be called with the correct headers');

    console.log('Test passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  } finally {
    axiosPostStub.restore();
  }
}

runTest();

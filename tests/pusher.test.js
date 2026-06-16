import {describe, it, expect, jest, afterEach} from '@jest/globals';
import nock from 'nock';
import axios from 'axios';
import { pushMetrics } from '../src/pusher.js';

describe('pushMetrics', () => {
  it('should send coverage metrics to the Prometheus Pushgateway', async () => {
    const axiosPostSpy = jest.spyOn(axios, 'post').mockResolvedValue();

    const prometheusEndpoint = 'http://localhost:9091';
    const jobName = 'test-job';
    const coverageData = {
      totalStatements: 4,
      totalCoveredStatements: 3,
      packageCoverage: {
        'github.com/owner/repo/package1': { totalStatements: 3, coveredStatements: 2 },
        'github.com/owner/repo/package2': { totalStatements: 1, coveredStatements: 1 },
      },
    };
    const labels = { branch: 'main' };

    await pushMetrics(prometheusEndpoint, jobName, coverageData, labels);

    const expectedUrl = `${prometheusEndpoint}/metrics/job/${jobName}/branch/main`;
    const expectedBody = `# TYPE go_test_coverage_statements gauge
go_test_coverage_statements 4
# TYPE go_test_coverage_covered_statements gauge
go_test_coverage_covered_statements 3
# TYPE go_test_coverage_package_statements gauge
# TYPE go_test_coverage_package_covered_statements gauge
go_test_coverage_package_statements{package="github.com/owner/repo/package1"} 3
go_test_coverage_package_covered_statements{package="github.com/owner/repo/package1"} 2
go_test_coverage_package_statements{package="github.com/owner/repo/package2"} 1
go_test_coverage_package_covered_statements{package="github.com/owner/repo/package2"} 1
`;

    expect(axiosPostSpy).toHaveBeenCalledWith(expectedUrl, expectedBody, {
      headers: { 'Content-Type': 'text/plain' },
    });

    axiosPostSpy.mockRestore();
  });

  it('should use job-only URL when no labels are provided', async () => {
    const axiosPostSpy = jest.spyOn(axios, 'post').mockResolvedValue();

    await pushMetrics('http://localhost:9091', 'test-job', { totalStatements: 10, totalCoveredStatements: 5, packageCoverage: {} }, {});

    expect(axiosPostSpy).toHaveBeenCalledWith(
      'http://localhost:9091/metrics/job/test-job',
      expect.any(String),
      expect.any(Object),
    );

    axiosPostSpy.mockRestore();
  });

  describe('basic auth', () => {
    afterEach(() => nock.cleanAll());

    it('should send Authorization header with correct Basic credentials', async () => {
      const scope = nock('http://localhost:9091', {
        reqheaders: {
          authorization: `Basic ${Buffer.from('pushgate-user:hunter2').toString('base64')}`,
        },
      })
        .post('/metrics/job/test-job')
        .reply(200);

      await pushMetrics('http://localhost:9091', 'test-job', { totalStatements: 1, totalCoveredStatements: 1, packageCoverage: {} }, {}, 'pushgate-user', 'hunter2');

      expect(scope.isDone()).toBe(true);
    });

    it('should not send Authorization header when credentials are omitted', async () => {
      let capturedHeaders;
      nock('http://localhost:9091')
        .post('/metrics/job/test-job')
        .reply(200, function () { capturedHeaders = this.req.headers; });

      await pushMetrics('http://localhost:9091', 'test-job', { totalStatements: 1, totalCoveredStatements: 1, packageCoverage: {} }, {});

      expect(capturedHeaders.authorization).toBeUndefined();
    });
  });
});
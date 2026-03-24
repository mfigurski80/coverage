const axios = require('axios');
const pushMetrics = require('../src/pusher');

describe('pushMetrics', () => {
  it('should send coverage metrics to the Prometheus Pushgateway', async () => {
    const axiosPostSpy = jest.spyOn(axios, 'post').mockResolvedValue();

    const prometheusEndpoint = 'http://localhost:9091';
    const jobName = 'test-job';
    const coverageData = {
      totalCoverage: 75,
      packageCoverage: {
        'github.com/owner/repo/package1': 66.66666666666666,
        'github.com/owner/repo/package2': 100,
      },
    };
    const labels = { branch: 'main' };

    await pushMetrics(prometheusEndpoint, jobName, coverageData, labels);

    const expectedUrl = `${prometheusEndpoint}/metrics/job/${jobName}`;
    const expectedBody = `# TYPE go_test_coverage_percentage gauge
go_test_coverage_percentage{job="test-job", branch="main"} 75
# TYPE go_test_coverage_package_percentage gauge
go_test_coverage_package_percentage{job="test-job", branch="main",package="github.com/owner/repo/package1"} 66.66666666666666
go_test_coverage_package_percentage{job="test-job", branch="main",package="github.com/owner/repo/package2"} 100
`;

    expect(axiosPostSpy).toHaveBeenCalledWith(expectedUrl, expectedBody, {
      headers: { 'Content-Type': 'text/plain' },
    });

    axiosPostSpy.mockRestore();
  });
});
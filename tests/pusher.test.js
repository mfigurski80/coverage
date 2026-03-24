const axios = require('axios');
const pushMetrics = require('../src/pusher');

describe('pushMetrics', () => {
  it('should send coverage metrics to the Prometheus Pushgateway', async () => {
    const axiosPostSpy = jest.spyOn(axios, 'post');

    const prometheusEndpoint = 'http://localhost:9091';
    const jobName = 'test-job';
    const coverageData = {
      totalCoverage: 80.5,
      packageCoverage: {
        'github.com/owner/repo/package1': 75.0,
        'github.com/owner/repo/package2': 90.0,
      },
    };
    const labels = { branch: 'main' };

    await pushMetrics(prometheusEndpoint, jobName, coverageData, labels);

    const expectedUrl = `${prometheusEndpoint}/metrics/job/${jobName}`;
    const expectedBody = `# TYPE go_test_coverage_percentage gauge
go_test_coverage_percentage{branch="main"} 80.5
# TYPE go_test_coverage_package_percentage gauge
go_test_coverage_package_percentage{branch="main",package="github.com/owner/repo/package1"} 75
go_test_coverage_package_percentage{branch="main",package="github.com/owner/repo/package2"} 90
`;

    expect(axiosPostSpy).toHaveBeenCalledWith(expectedUrl, expectedBody, {
      headers: { 'Content-Type': 'text/plain' },
    });

    axiosPostSpy.mockRestore();
  });
});
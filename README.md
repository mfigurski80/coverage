# Prometheus Golang Code Coverage GitHub Action

This GitHub Action calculates Go code coverage from a `coverage.txt` file and pushes it as a metric to a Prometheus Pushgateway.

## Inputs

*   `prometheus_endpoint` (required): The endpoint of the Prometheus Pushgateway.
*   `labels` (optional): Additional labels to include in the Pushgateway grouping key (e.g., "env=prod,region=us-east-1"). Each label becomes a path segment in the push URL, ensuring pushes with different label values write to separate metric groups.

## Example Usage in a Workflow

```yaml
name: Go Test and Coverage
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Go
      uses: actions/setup-go@v3
      with:
        go-version: 1.21
    - name: Run tests with coverage
      run: go test -v -coverprofile=coverage.txt ./...
    - name: Go Code Coverage to Prometheus
      uses: mfigurski80/coverage@v0.0.2
      with:
        prometheus_endpoint: 'http://your-pushgateway.com:9091'
        labels: 'branch=${{ github.ref_name }}'
```

## Example Prometheus Metric

The action pushes to a URL like:

```
POST http://your-pushgateway.com:9091/metrics/job/build/branch/main
```

With a body like:

```
# TYPE go_test_coverage_percentage gauge
go_test_coverage_percentage 85.2
# TYPE go_test_coverage_package_percentage gauge
go_test_coverage_package_percentage{package="github.com/mfigurski80/coverage/package1"} 85.2
go_test_coverage_package_percentage{package="github.com/mfigurski80/coverage/package2"} 92.0
```

Labels from the URL are automatically attached to all metrics by the Pushgateway.

## Core Links

*   **Go Cover Tool:** [https://pkg.go.dev/cmd/cover](https://pkg.go.dev/cmd/cover)
*   **Prometheus Pushgateway:** [https://github.com/prometheus/pushgateway](https://github.com/prometheus/pushgateway)
*   **Creating a JavaScript GitHub Action:** [https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)

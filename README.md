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
POST http://your-pushgateway.com:9091/metrics/job/owner_repo_build/branch/main
```

The job name is namespaced as `{owner}_{repo}_{job}` to avoid collisions across repositories sharing the same Pushgateway. Labels are appended as path segments to form the grouping key.

With a body like:

```
# TYPE go_test_coverage_statements gauge
go_test_coverage_statements 120
# TYPE go_test_coverage_covered_statements gauge
go_test_coverage_covered_statements 102
# TYPE go_test_coverage_package_statements gauge
# TYPE go_test_coverage_package_covered_statements gauge
go_test_coverage_package_statements{package="github.com/owner/repo/pkg"} 80
go_test_coverage_package_covered_statements{package="github.com/owner/repo/pkg"} 68
```

Labels from the URL are automatically attached to all metrics by the Pushgateway. To compute coverage percentage in Prometheus:

```promql
go_test_coverage_covered_statements / go_test_coverage_statements
```

This allows correct aggregation across repos by summing raw counts before dividing.

## Core Links

*   **Go Cover Tool:** [https://pkg.go.dev/cmd/cover](https://pkg.go.dev/cmd/cover)
*   **Prometheus Pushgateway:** [https://github.com/prometheus/pushgateway](https://github.com/prometheus/pushgateway)
*   **Creating a JavaScript GitHub Action:** [https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)

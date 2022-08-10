---
title: "使用中间件统一记录 Prometheus 指标"
description: "介绍如何用 req 的中间件来记录 Prometheus 指标"
lead: ""
draft: false
images: []
weight: 1005
menu:
  docs:
    parent: "examples"
toc: true
---

## 概述

Go 程序使用 Prometheus 官方的 [client_golang](https://github.com/prometheus/client_golang) 来暴露指标，如果需要暴露作为客户端发送请求相关的指标，比如统计请求数，统计请求 P99 耗时等，可以利用 req 的中间件来统一记录，本文将给出代码实例。

## 示例

代码:

```go
package main

import (
  "fmt"
  "github.com/imroc/req/v3"
  "github.com/prometheus/client_golang/prometheus"
  "github.com/prometheus/client_golang/prometheus/promhttp"
  "math/rand"
  "net/http"
  "strconv"
  "time"
)

var (
  SendHTTPRequests = prometheus.NewCounterVec(
    prometheus.CounterOpts{
      Name: "send_http_requests_total",
      Help: "Number of the http requests sent since the server started",
    },
    []string{"method", "host", "path", "retry", "code"},
  )
  SendHTTPRequestsDuration = prometheus.NewHistogramVec(
    prometheus.HistogramOpts{
      Name:    "send_http_requests_duration_seconds",
      Help:    "Duration in seconds to send http requests",
      Buckets: prometheus.DefBuckets,
    },
    []string{"method", "host", "path", "retry", "code"},
  )
)

var client = req.C().
  SetCommonRetryCondition(func(resp *req.Response, err error) bool {
    if err != nil {
      return true
    }
    n := rand.Intn(5) // 1/5 chance of retrying
    if n == 0 {
      return true
    }
    return false
  }).
  SetCommonRetryCount(3).
  // Record prometheus metrics in response middleware
  OnAfterResponse(func(c *req.Client, resp *req.Response) error {
    if resp.Response == nil { // Ignore requests that don't receive a response. e.g. dns error or connect timeout.
      return nil
    }

    req := resp.Request
    retry := "no"
    if req.RetryAttempt > 0 {
      retry = "yes"
    }
    code := strconv.Itoa(resp.StatusCode)

    SendHTTPRequests.WithLabelValues(
      req.Method, req.URL.Host, req.URL.Path, retry, code,
    ).Inc()

    duration := float64(resp.TotalTime()) / float64(time.Second)
    SendHTTPRequestsDuration.WithLabelValues(
      req.Method, req.URL.Host, req.URL.Path, retry, code,
    ).Observe(duration)

    return nil
  })

func init() {
  prometheus.MustRegister(SendHTTPRequests, SendHTTPRequestsDuration)
  client.EnableDebugLog() // Enable debug log if you want some output.
}

func main() {
  go func() {
    http.Handle("/metrics", promhttp.Handler())
    http.ListenAndServe(":2112", nil)
  }()
  urls := []string{
    "https://httpbin.org/get",
    "https://api.github.com/users/imroc",
  }
  for {
    for _, url := range urls {
      _, err := client.R().
        Get(url)
      if err != nil {
        fmt.Println("ERROR:", err.Error())
        continue
      }
    }
    time.Sleep(1 * time.Second)
  }
}
```

程序运行起来后，访问暴露指标的接口查看指标数据:

```bash
$ curl 127.0.0.1:2112/metrics
# HELP send_http_requests_duration_seconds Duration in seconds to send http requests
# TYPE send_http_requests_duration_seconds histogram
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="0.005"} 0
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="0.01"} 0
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="0.025"} 0
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="0.05"} 49
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="0.1"} 49
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="0.25"} 49
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="0.5"} 50
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="1"} 50
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="2.5"} 50
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="5"} 50
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="10"} 50
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="+Inf"} 50
send_http_requests_duration_seconds_sum{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no"} 2.1124555390000004
send_http_requests_duration_seconds_count{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no"} 50
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="0.005"} 0
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="0.01"} 0
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="0.025"} 0
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="0.05"} 10
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="0.1"} 10
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="0.25"} 10
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="0.5"} 10
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="1"} 10
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="2.5"} 10
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="5"} 10
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="10"} 10
send_http_requests_duration_seconds_bucket{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="+Inf"} 10
send_http_requests_duration_seconds_sum{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes"} 0.361903761
send_http_requests_duration_seconds_count{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes"} 10
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="no",le="0.005"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="no",le="0.01"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="no",le="0.025"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="no",le="0.05"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="no",le="0.1"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="no",le="0.25"} 117
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="no",le="0.5"} 123
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="no",le="1"} 125
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="no",le="2.5"} 125
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="no",le="5"} 125
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="no",le="10"} 125
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="no",le="+Inf"} 125
send_http_requests_duration_seconds_sum{code="200",host="httpbin.org",method="GET",path="/get",retry="no"} 29.26371210600001
send_http_requests_duration_seconds_count{code="200",host="httpbin.org",method="GET",path="/get",retry="no"} 125
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="yes",le="0.005"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="yes",le="0.01"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="yes",le="0.025"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="yes",le="0.05"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="yes",le="0.1"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="yes",le="0.25"} 24
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="yes",le="0.5"} 24
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="yes",le="1"} 26
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="yes",le="2.5"} 26
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="yes",le="5"} 26
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="yes",le="10"} 26
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",retry="yes",le="+Inf"} 26
send_http_requests_duration_seconds_sum{code="200",host="httpbin.org",method="GET",path="/get",retry="yes"} 6.371755628
send_http_requests_duration_seconds_count{code="200",host="httpbin.org",method="GET",path="/get",retry="yes"} 26
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="0.005"} 0
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="0.01"} 0
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="0.025"} 0
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="0.05"} 75
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="0.1"} 75
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="0.25"} 75
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="0.5"} 75
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="1"} 75
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="2.5"} 75
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="5"} 75
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="10"} 75
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no",le="+Inf"} 75
send_http_requests_duration_seconds_sum{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no"} 2.6409077139999995
send_http_requests_duration_seconds_count{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no"} 75
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="0.005"} 0
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="0.01"} 0
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="0.025"} 0
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="0.05"} 17
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="0.1"} 17
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="0.25"} 17
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="0.5"} 17
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="1"} 17
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="2.5"} 17
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="5"} 17
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="10"} 17
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes",le="+Inf"} 17
send_http_requests_duration_seconds_sum{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes"} 0.620352797
send_http_requests_duration_seconds_count{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes"} 17
# HELP send_http_requests_total Number of the http requests sent since the server started
# TYPE send_http_requests_total counter
send_http_requests_total{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="no"} 50
send_http_requests_total{code="200",host="api.github.com",method="GET",path="/users/imroc",retry="yes"} 10
send_http_requests_total{code="200",host="httpbin.org",method="GET",path="/get",retry="no"} 125
send_http_requests_total{code="200",host="httpbin.org",method="GET",path="/get",retry="yes"} 26
send_http_requests_total{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="no"} 75
send_http_requests_total{code="403",host="api.github.com",method="GET",path="/users/imroc",retry="yes"} 17
```

监控采集后，用类似如下的 PromQL 统计请求数:

```promql
sum by (host) (
  rate(send_http_requests_total[5m])
)
sum by (host, path) (
  rate(send_http_requests_total{retry="no"}[5m])
)
```

统计 P99 耗时:

```promql
histogram_quantile(0.99, rate(send_http_requests_duration_seconds_bucket[5m]))
histogram_quantile(0.99, sum by (host, path, le) (rate(send_http_requests_duration_seconds_bucket[5m])))
```

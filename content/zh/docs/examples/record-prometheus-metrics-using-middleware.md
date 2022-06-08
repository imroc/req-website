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
		[]string{"method", "host", "path", "retry"},
	)
	SendHTTPRequestsDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "send_http_requests_duration_seconds",
			Help:    "Duration in seconds to send http requests",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "host", "path", "code"},
	)
)

var client = req.C().
	// Record request count metrics in request middleware
	OnBeforeRequest(func(c *req.Client, r *req.Request) error {
		retry := "no"
		if r.RetryAttempt > 0 {
			retry = "yes"
		}
		SendHTTPRequests.WithLabelValues(
			r.Method, r.URL.Host, r.URL.Path, retry,
		).Inc()
		return nil
	}).
	// Record request time metrics in response middleware
	OnAfterResponse(func(c *req.Client, resp *req.Response) error {
		req := resp.Request
		duration := float64(resp.TotalTime()) / float64(time.Second)
		SendHTTPRequestsDuration.WithLabelValues(
			req.Method, req.URL.Host, req.URL.Path, strconv.Itoa(resp.StatusCode),
		).Observe(duration)
		return nil
	})

func init() {
	prometheus.MustRegister(SendHTTPRequests, SendHTTPRequestsDuration)
	// client.EnableDebugLog() // Enable debug log if you want some output.
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
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",le="0.005"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",le="0.01"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",le="0.025"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",le="0.05"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",le="0.1"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",le="0.25"} 0
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",le="0.5"} 105
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",le="1"} 111
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",le="2.5"} 112
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",le="5"} 112
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",le="10"} 112
send_http_requests_duration_seconds_bucket{code="200",host="httpbin.org",method="GET",path="/get",le="+Inf"} 112
send_http_requests_duration_seconds_sum{code="200",host="httpbin.org",method="GET",path="/get"} 38.093914788999996
send_http_requests_duration_seconds_count{code="200",host="httpbin.org",method="GET",path="/get"} 112
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",le="0.005"} 0
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",le="0.01"} 0
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",le="0.025"} 0
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",le="0.05"} 0
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",le="0.1"} 99
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",le="0.25"} 109
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",le="0.5"} 110
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",le="1"} 111
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",le="2.5"} 111
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",le="5"} 111
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",le="10"} 111
send_http_requests_duration_seconds_bucket{code="403",host="api.github.com",method="GET",path="/users/imroc",le="+Inf"} 111
send_http_requests_duration_seconds_sum{code="403",host="api.github.com",method="GET",path="/users/imroc"} 10.233208129000001
send_http_requests_duration_seconds_count{code="403",host="api.github.com",method="GET",path="/users/imroc"} 111
# HELP send_http_requests_total Number of the http requests sent since the server started
# TYPE send_http_requests_total counter
send_http_requests_total{host="api.github.com",method="GET",path="/users/imroc",retry="no"} 112
send_http_requests_total{host="httpbin.org",method="GET",path="/get",retry="no"} 112
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

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

## 使用 Response 中间件的示例

```go
package main

import (
  "github.com/imroc/req/v3"
  "github.com/prometheus/client_golang/prometheus"
  "strconv"
  "time"
)

var (
  SendHTTPRequests = prometheus.NewCounterVec(
    prometheus.CounterOpts{
      Name: "send_http_requests_total",
      Help: "Number of the http requests sent since the server started",
    },
    []string{"method", "host", "path", "code"},
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
  OnAfterResponse(func(c *req.Client, resp *req.Response) error {
    req := resp.Request

    if resp.Response == nil { // Ignore requests that don't receive a response. e.g. dns error or connect timeout.
      SendHTTPRequests.WithLabelValues(
        req.Method, req.URL.Host, req.URL.Path, "",
      ).Inc()
      return nil
    }

    code := strconv.Itoa(resp.StatusCode)
    SendHTTPRequests.WithLabelValues(
      req.Method, req.URL.Host, req.URL.Path, code,
    ).Inc()

    duration := float64(resp.TotalTime()) / float64(time.Second)
    SendHTTPRequestsDuration.WithLabelValues(
      req.Method, req.URL.Host, req.URL.Path, code,
    ).Observe(duration)
    return nil
  })

func init() {
  prometheus.MustRegister(SendHTTPRequests, SendHTTPRequestsDuration)
}
```

## 使用 Client 中间件版本的示例

```go
package main

import (
	"github.com/imroc/req/v3"
	"github.com/prometheus/client_golang/prometheus"
	"strconv"
	"time"
)

var (
	SendHTTPRequests = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "send_http_requests_total",
			Help: "Number of the http requests sent since the server started",
		},
		[]string{"method", "host", "path", "code"},
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
	WrapRoundTripFunc(func(rt req.RoundTripper) req.RoundTripFunc {
		return func(req *req.Request) (resp *req.Response, err error) {
			resp, err = rt.RoundTrip(req)
			if resp.Response == nil { // Ignore requests that don't receive a response. e.g. dns error or connect timeout.
				SendHTTPRequests.WithLabelValues(
					req.Method, req.URL.Host, req.URL.Path, "",
				).Inc()
				return
			}
			code := strconv.Itoa(resp.StatusCode)
			SendHTTPRequests.WithLabelValues(
				req.Method, req.URL.Host, req.URL.Path, code,
			).Inc()

			duration := float64(resp.TotalTime()) / float64(time.Second)
			SendHTTPRequestsDuration.WithLabelValues(
				req.Method, req.URL.Host, req.URL.Path, code,
			).Observe(duration)
			return
		}
	})

func init() {
	prometheus.MustRegister(SendHTTPRequests, SendHTTPRequestsDuration)
}
```

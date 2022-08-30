---
title: "Record Prometheus Metrics Using Middleware"
description: "This article will introduce how to record prometheus metrics using middleware"
lead: ""
draft: false
images: []
weight: 1005
menu:
  docs:
    parent: "examples"
toc: true
---

## Overview

Go programs use Prometheus' [client_golang](https://github.com/prometheus/client_golang) to expose metrics. If you need to expose metrics related to http requests sent by client, such as request count or P99 of time-consuming, you can use req's middleware to record prometheus metrics for all requests. This article will show you the code example.

## Example using Response Middleware

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

## Example using Client Middleware

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

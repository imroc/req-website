---
title: "Client and Transport Middleware are Supported, Unlocking More Practical Usage"
description: ""
lead: ""
date: 2022-08-15T11:00:00+08:00
lastmod: 2022-07-15T11:00:00+08:00
draft: false
weight: 50
contributors: ["roc"]
---

<img src="/images/req.png">

## Added Client and Transport Middleware Capabilities

`req` currently supports Client and Transport middleware, you can update req to the latest version:

```bash
go get -u github.com/imroc/req/v3
```

## Quick Overview of Usage

Client Middleware:

```go
client := req.C()
client.WrapRoundTripFunc(func(rt req.RoundTripper) req.RoundTripFunc {
	return func(req *req.Request) (resp *req.Response, err error) {
		// before request
		// ...
		resp, err = rt.RoundTrip(req)
		// after response
		// ...
		return
	}
})
```

Transport Middleware:

```go
transport := req.C().GetTransport()
transport.WrapRoundTripFunc(func(rt http.RoundTripper) req.HttpRoundTripFunc {
	return func(req *http.Request) (resp *http.Response, err error) {
		// before request
		// ...
		resp, err = rt.RoundTrip(req)
		// after response
		// ...
		return
	}
})
```

## Applicable Scenarios

Client and Transport middleware can intercept all requests and responses, and can add any required logic before the request and after the response, for example, log, metrics, trace and other data can be recorded for all HTTP requests, or exceptions can be handled uniformly.

Especially in the trace scenario, when implementing the tracing, the logic often needs to cover both pre-request and post-response. It is not appropriate to use `RequestMiddleware` or `ResponseMiddleware`. In this case, you can choose to use Client or Transport middleware.

The difference between Client and Transport middleware is that `*req.Request` and `*req.Response` can be accessed in Client middleware, while only `*http.Request` and `*http. Response` can be accessed in Transport middleware, the latter is a subset of the former, so the Client middleware is more powerful.

When to use Transport middleware? It is generally used when integrating with other libraries or existing projects. Use `*req.Transport` to replace the `Transport` of `http.Client`, and use the minimal code changes to record log, metrics, trace data for all http requests, or uniformly handle exceptions.

## What's Next

- [Introduction and usage of Client and Transport middleware](../../docs/tutorial/middleware-for-client-and-transport/)
- [Integrate with OpenTelemetry and Jaeger using Client middleware](../../docs/examples/integrate-opentelemetry-and-jaeger/)
- [Integrate with goquery using Client middleware](../../docs/examples/integrate-with-goquery/)
- [Integrate OpenTelemetry with Kubernetes client-go to Support Tracing using Transport Middleware](../../docs/examples/integrate-with-client-go/#an-example-of-client-go-integrating-opentelemetry-to-support-tracing)

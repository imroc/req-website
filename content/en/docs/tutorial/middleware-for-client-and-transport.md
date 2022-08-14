---
title: "Client and Transport Middleware"
description: "This article will introduce how to use client and transport middleware."
draft: false
images: []
weight: 601
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Usage Scenarios

`RequestMiddleware` can only be executed before the request is sent, `ResponseMiddleware` can only be executed after the response is received, and in some scenarios, the logic in a middleware function is required to cover the both pre-request and post-response, such as tracing scenarios, a span is generally created at the beginning of a function, and then `defer span.End()` is used to ensure that the span is ended at the end of the function, so that the execution time of the function can be counted. If a span is created in `RequestMiddleware` or `ResponseMiddleware`, only the execution time of the middleware itself can be counted, but the time consuming of the entire request cannot be counted. At this time, we can use Client middleware or Transport middleware to create a span before the request, record the request information to the span, and record the response information to the span after the response, and finally end the span to count the entire request time.

If it is a scenario where only `req.Transport` is used and `req.Client` is not used (usually, the `req.Transport` is used to replace the `http.Transport` of the existing project), the `RequestMiddleware` and `ResponseMiddleware` set for the Client are meaningless, and you can use the Transport middleware at this time. It is implemented as stock project code, and the ability to record logs, metrics, tracing, etc. uniformly for all requests is added.

If only Transport is used, but Client is not used (usually, the `req.Transport` is used to replace the `http.Transport` of the existing project), the `RequestMiddleware` and `ResponseMiddleware` set for the Client were not been used during request, and you can use Transport Middleware at this time, record logs, metrics and traces for all requests with minimal code change for existing project.

## Client Middleware vs Transport Middleware

They are very similar in that they can cover both the pre-request and the post-response. The difference is that Client middleware can access `*req.Request` and `*req.Response`, while the Transport middleware can only access `*http.Request` and `*http.Response`, which the latter is only a subset of the former, so the Client middleware is more powerful. One of the key benefits of Client middleware is that you can get request body or response boy inside the middleware without interfering with requests, and if you do it in Transport middleware, it will cause destructive effects: the server cannot receive the request body, or the request caller cannot receive the response body.

how to choose ? Client middleware is definitely preferred.

When to use Transport middleware ? If it is integrated with other existing libraries or projects, which is inconvenient to replace the underlying http request library with req, or the code changes are large, it is inconvenient to directly replace the underlying http request library with req, but you want to use req's Transport middleware capabilities to unify logging, metrics, tracing and other information are recorded for all requests, which is suitable for using Transport middleware.

## Client Middleware Usage

Client provides a convenience method `WrapRoundTripFunc` to directly pass a function as middleware:

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

If necessary, you can also implement the interface yourself and use `WrapRoundTrip` to pass in the middleware.

## Transport Middleware Usage

Transport provides a convenience method `WrapRoundTripFunc` to directly pass a function as middleware:

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

If necessary, you can also implement the interface yourself and use `WrapRoundTrip` to pass in the middleware.

## Examples

* [Integrate with OpenTelemetry and Jaeger](../../examples/integrate-opentelemetry-and-jaeger/)

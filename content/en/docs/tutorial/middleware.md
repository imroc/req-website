---
title: "Request and Response Middleware"
description: "This article will introduce how to use request and response middleware."
draft: false
images: []
weight: 600
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Request Middleware

Use `Client.OnBeforeRequest` to set request middleware, you can access Client and current Request object to do something what you need before the Request is sent:

```go
client := req.C()

// Registering Request Middleware
client.OnBeforeRequest(func(c *req.Client, r *req.Request) error {
	// You can access Client and current Request object to do something
	// as you need

    return nil  // return nil if it is success
  })
```

## Response Middleware

Use `Client.OnAfterResponse` to set response middleware, you can access Client and current Request object to do something what you need before the Response is returned:

```go
client := req.C()

// Registering Response Middleware
client.OnAfterResponse(func(c *req.Client, r *req.Response) error {
    if resp.Err != nil { // you can skip if error occurs.
        return nil
    }

    // You can access Client and current Response object to do something
    // as you need

    return nil  // return nil if it is success
  })
```

If an error occurs, `resp.Err` will not be nil, you can judge whether an error occurs inside the middleware function to decide whether to skip the execution of subsequent logic. For scenarios such as recording metrics or tracing information, you want to execute it regardless of whether there is an error, you don't need to judge.

## Examples

* [Handle Exceptions with Middleware](../../examples/handle-exceptions-with-middleware/)
* [Record Prometheus Metrics Using Middleware](../../examples/record-prometheus-metrics-using-middleware/)

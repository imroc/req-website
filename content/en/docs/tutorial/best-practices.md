---
title: "Best Practices"
description: "This article will introduce best practices of req"
draft: false
images: []
weight: 610
menu:
  docs:
    parent: "tutorial"
toc: true
---

This article will introduce some best practices for using req.

## Reuse Client

Do not create `Client` for each `Request`, which will cause unnecessary overhead. Usually, we can reuse the same Client to send all requests.

```go
var client = req.C()

func main() {
  resp, err := client.R().Get(url1)
  ...
  resp, err = client.R().Get(url2)
  ...
}
```

## Let Your Program Support Enabling Debug

You can integrate the powerful debugging capabilities of `req` into your program, so that when you enable Debug, you can see the details of the request and response:
* If the program is a command line tool, run it once and exit, you can [Enable Debug via Flag or Env](../../examples/enable-debug-via-flag-or-env/).
* If the program is a server-like long-running application, you can [Enable Debug Dynamically in Production](../../examples/enable-debug-dynamically-in-production/).

## Unified Exception Handling Using Middleware

We can handle exceptions for all requests using req's middleware to reduce duplicate code:
* The error response message format of all APIs on the same server is usually the same. We can define a struct representing the error response and implement the error interface to uniformly convert the API error response into a go error and return.
* When an unexpected response is returned, which is neither a successful response nor an error response. We can dump the HTTP content, and convert it into an error to return, which is helpful to troubleshoot problems.

Refer to [Handle Exceptions with Middleware](../../examples/handle-exceptions-with-middleware/)。

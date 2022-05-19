---
title: "请求和响应中间件"
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
    // You can access Client and current Response object to do something
    // as you need

    return nil  // return nil if it is success
  })
```

---
title: "请求和响应中间件"
description: "介绍如何使用请求和响应的中间件"
draft: false
images: []
weight: 600
menu:
  docs:
    parent: "tutorial"
toc: true
---

## 请求中间件

使用 `Client.OnBeforeRequest` 可以注册请求中间件，你可以让在请求发出前执行一些回调，回调函数里可以访问到 `Client` 和 `Request` 对象:

```go
client := req.C()

// Registering Request Middleware
client.OnBeforeRequest(func(c *req.Client, r *req.Request) error {
	// You can access Client and current Request object to do something
	// as you need, e.g. Record the metrics.

    return nil  // return nil if it is success
  })
```

## 响应中间件

使用`Client.OnAfterResponse` 可以注册响应中间件，你可以在响应返回前执行一些回调，回调函数里可以访问到 `Client` 和 `Response` 对象:

```go
client := req.C()

// Registering Response Middleware
client.OnAfterResponse(func(c *req.Client, r *req.Response) error {
    // You can access Client and current Response object to do something
    // as you need

    return nil  // return nil if it is success
  })
```

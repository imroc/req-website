---
title: "Request 与 Response 中间件"
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
client.OnBeforeRequest(func(client *req.Client, req *req.Request) error {
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
client.OnAfterResponse(func(client *req.Client, resp *req.Response) error {
    if resp.Err != nil { // you can skip if error occurs.
        return nil
    }

    // You can access Client and current Response object to do something
    // as you need

    return nil  // return nil if it is success
  })
```

如果发生了 error，`resp.Err` 将不为 nil，你可以在中间件函数内部判断是否发生 error 来决定是否跳过执行后续逻辑。像记录监控指标或者链路追踪信息等场景，不管是否有 error 都希望要执行，就可以不用判断。

## 示例

* [使用中间件统一处理异常](../../examples/handle-exceptions-with-middleware/)
* [使用中间件统一记录 Prometheus 指标](../../examples/record-prometheus-metrics-using-middleware/)

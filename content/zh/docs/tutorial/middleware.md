---
title: "Transport 中间件"
description: "介绍如何使用 Transport 中间件"
draft: false
images: []
weight: 601
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Transport 中间件的使用场景

`RequestMiddleware` 只能在发起请求之前执行，`ResponseMiddleware` 只能在响应之后执行，而在某些场景需要在一个中间件函数里的逻辑，同时覆盖请求前与响应后，比如 tracing 场景，在请求前创建 span，在响应后读取 span 进一步处理:

```go

```

---
title: "Client 与 Transport 中间件已支持，解锁更多实用玩法"
description: ""
lead: ""
date: 2022-08-15T11:00:00+08:00
lastmod: 2022-07-15T11:00:00+08:00
draft: false
weight: 50
contributors: ["roc"]
---

<img src="/images/req.png">

## 新增 Client 与 Transport 中间件能力

req 当前已支持 Client 和 Transport 中间件，您可以更新 req 到最新版:

```bash
go get -u github.com/imroc/req/v3
```

## 用法速览

Client 中间件:

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

Transport 中间件:

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

## 适用场景

Client 与 Transport 中间件可以拦截所有请求与响应，在请求前和响应后都可以分别加入任何需要的逻辑，比如可以统一为所有 HTTP 请求记录 log、metrics、trace 等数据，或者统一处理异常。

特别是在 trace 场景，在进行链路追踪时，逻辑往往需要同时覆盖请求前与响应后，用 `RequestMiddleware` 或 `ResponseMiddleware` 是不合适的，这时候就可以选择用 Client 或 Transport 中间件。

Client 与 Transport 中间件的区别是，在 Client 中间件中可以访问 `*req.Request` 与 `*req.Response`，在 Transport 中间件中只能访问到 `*http.Request` 与 `*http.Response`，后者是前者的子集，所以 Client 中间件功能更强大。

什么情况下用 Transport 中间件？一般是与其它库或存量项目进行集成时用，使用 `*req.Transport` 替换掉 `http.Client` 的 `Transport`，用最少的代码改动，统一为所有 http 请求记录 log、metrics、trace 等数据，或者统一处理异常。

## 下一步阅读

- [Client 与 Transport 中间件介绍与用法](../../docs/tutorial/middleware-for-client-and-transport/)
- [利用 Client 中间件与 OpenTelemetry 和 Jaeger 集成](../../docs/tutorial/middleware-for-client-and-transport/)

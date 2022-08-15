---
title: "Client 与 Transport 中间件"
description: "介绍如何使用 Client 中间件与 Transport 中间件"
draft: false
images: []
weight: 601
menu:
  docs:
    parent: "tutorial"
toc: true
---

## 使用场景

`RequestMiddleware` 只能在发起请求之前执行，`ResponseMiddleware` 只能在响应之后执行，而在某些场景需要在一个中间件函数里的逻辑，同时覆盖请求前与响应后，比如 tracing 场景，一般在函数开头创建 span，然后用 `defer span.End()` 确保 span 在函数结束时终止，以便统计函数执行时间。如果在 `RequestMiddleware` 或 `ResponseMiddleware` 创建 span，也只能统计到中间件自身执行时间的耗时，无法统计到整个请求的耗时。这个时候我们就可以使用 Client 中间件或 Transport 中间件，在请求前创建 span，记录请求信息到 span，在响应后记录响应信息到 span，最后才结束 span 以便统计请求整体耗时。

另外如果是只用 Transport，不用 Client 的场景(通常是用 req 的 Transport 来替换现有项目的 http Transport)，给 Client 设置的 `RequestMiddleware` 和 `ResponseMiddleware` 是无意义的，这时候就可以用 Transport 中间件来实现为存量项目代码，增加为所有请求统一记录 log、metrics、tracing 等能力。

##  Client 中间件与 Transport 中间件的区别

它们很相似，都可以同时覆盖请求前与响应后，不同的是，Client 中间内部可以访问到 `*req.Request` 与 `*req.Response`，而 Transport 中间件只能访问到 `*http.Request` 与 `*http.Response`，后者只是前者的功能子集，所以 Client 中间件更强大，其中有一个比较关键的好处是，在 Client 中间件内部即使获取请求体和响应体也不会影响正常请求，而如果在 Transport 中间件将请求体或响应体读取走就会造成破坏性影响: 服务端收不到请求体，客户端上层调用方收不到响应体。

如何选择？肯定首选 Client 中间件。

那什么情况下用 Transport 中间件？如果是与其它现有的，可以自定义 Transport 的库进行集成，或者是有历史包袱的项目，不方便直接将底层 http 请求库替换成 req，但又想要利用 req 的 Transport 中间件能力，统一为所有请求记录 log、metrics、tracing 之类的信息，这种情况就适合用 Transport 中间件。

## Client 中间件用法

Client 提供一个便捷的方法 `WrapRoundTripFunc` 直接将函数作为中间件传入:

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

如有需要，你也可以自己实现接口，用 `WrapRoundTrip` 传入中间件。

## Transport 中间件用法

Transport 提供一个便捷的方法 `WrapRoundTripFunc` 直接将函数作为中间件传入:

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

如有需要，你也可以自己实现接口，用 `WrapRoundTrip` 传入中间件。

## 示例

* [与 OpenTelemetry 和 Jaeger 集成](../../examples/integrate-opentelemetry-and-jaeger/)

---
title: "最佳实践"
description: "介绍使用 req 相关的最佳实践"
draft: false
images: []
weight: 610
menu:
  docs:
    parent: "tutorial"
toc: true
---

本文将介绍使用 req 的一些最佳实践。

## 重用 Client

不要每次发请求都创建 Client，造成不必要的开销，通常可以复用同一 Client 发所有请求。

```go
var client = req.C()

func main() {
  resp, err := client.R().Get(url1)
  ...
  resp, err = client.R().Get(url2)
  ...
}
```

## 让程序支持开启 Debug

可以将 `req` 强大的调试能力集成到你的程序中，让开启 Debug 时，可以看到请求和响应的细节:
* 如果程序是命令行工具，运行一次就结束，可以 [通过命令行标志或环境变量开启 Debug](../../examples/enable-debug-via-flag-or-env/)。
* 如果程序是类似服务端的应用，需要长时间运行，可以 [在生产环境动态开启 Debug](../../examples/enable-debug-dynamically-in-production/)。

## 使用中间件统一处理异常

我们可以利用 `req` 的中间件能力来统一处理所有请求的异常，减少重复代码:
* 同一个服务端的所有 API 的错误响应消息格式通常都是一致的，我们可以定义一个代表错误响应的 struct 并实现 error 接口，将 API 错误响应统一转换为 error 返回。
* 遇到非预期的响应，既不是成功的响应，也不是错误的响应，我们可以将 HTTP 内容 dump 下来记录并统一转换为 error 返回，方便后续定位问题。

参考示例 [使用中间件为所有请求处理异常](../../examples/handle-exceptions-with-middleware/)。

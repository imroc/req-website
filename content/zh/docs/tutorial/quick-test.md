---
title: "HTTP 快速测试"
description: "用最少的代码发起 HTTP 测试"
draft: false
images: []
weight: 120
menu:
  docs:
    parent: "tutorial"
toc: true
---

## 使用全局包装方法

`req` 用全局方法包装了 `Client` 和 `Request` 的方法，不需要显式创建任何 `Client` 或 `Request` 就能快速发起请求，在背后实际是使用了默认的 `Client`:

```go
// Call the global methods just like the Client's method,
// so you can treat package name `req` as a Client, and
// you don't need to create any client explicitly.
client := req.SetTimeout(5 * time.Second).
	SetCommonBasicAuth("imroc", "123456").
	SetCommonHeader("Accept", "text/xml").
	SetUserAgent("my api client").
	DevMode()
```

```go
// Call the global method just like the Request's method,
// which will create request automatically using the default
// client, so you can treat package name `req` as a Request,
// and you don't need to create any request and client explicitly.
resp, err := req.SetQueryParam("page", "2").
	SetHeader("Accept", "application/json"). // Override client level settings at request level.
	Get("https://httpbin.org/get")
```

## 使用 MustXXX 方法

使用 `MustXXX` 方法可以忽略错误处理，让仅一行代码完成复杂的测试成为可能:

```go
fmt.Println(req.DevMode().R().MustGet("https://httpbin.org/get").TraceInfo())
```

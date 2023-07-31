---
title: "设置 Header"
description: "介绍如何设置请求的 Header"
draft: false
images: []
weight: 220
menu:
  docs:
    parent: "tutorial"
toc: true
---

## 在请求级别设置

使用 `SetHeader` 和 `SetHeaders` 在请求级别设置 Header:

```go
// Let's dump the header to see what's going on.
client := req.EnableDumpAllWithoutResponse().EnableForceHTTP1()

// Send a request with multiple headers.
client.R().
    SetHeader("accept", "application/json"). // Set one header
    SetHeaders(map[string]string{            // Set multiple headers at once
        "my-custom-header": "My Custom Value",
        "user":             "imroc",
    }).
    MustGet("https://httpbin.org/uuid")
```

```txt
GET /uuid HTTP/1.1
Host: httpbin.org
User-Agent: req/v3 (https://github.com/imroc/req)
Accept: application/json
My-Custom-Header: My Custom Value
User: imroc
Accept-Encoding: gzip
```

如果你想保持 Header 大小写不变，不进行自动转换，可以使用 `SetHeaderNonCanonical` 或 `SetHeadersNonCanonical` 来设置 Header，通常是后端服务没有遵循 `HTTP/1.1` 的规范，对大小写敏感了 (参考 [RFC 2616 - 4.2 Message Headers](https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2)):

```go
// Let's dump the header to see what's going on.
client := req.EnableDumpAllWithoutResponse().EnableForceHTTP1()

client.R().
    SetHeaderNonCanonical("my-Custom-header", "test"). // Set Non-Canonical header in HTTP/1.1, keep case unchanged
    SetHeadersNonCanonical(map[string]string{          // Set multiple non-canonical headers at once
        "my-Custom-Header": "test",
        "my-custom-header": "test",
    }).
    MustGet("https://httpbin.org/uuid")
```

```txt
GET /uuid HTTP/1.1
Host: httpbin.org
User-Agent: req/v3 (https://github.com/imroc/req)
my-Custom-Header: test
my-Custom-header: test
my-custom-header: test
Accept-Encoding: gzip
```

如果你想控制 Header 的顺序来构造 HTTP 指纹，可以使用 `SetHeaderOrder` 和 `SetPseudoHeaderOrder` 来控制：

```go
client.R().SetHeaderOrder(
    "custom-header",
    "cookie",
    "user-agent",
    "accept-encoding",
)

// pseudo-header is only used in http2 and http3
client.R().SetPseudoHeaderOrder(
    ":scheme",
    ":authority",
    ":path",
    ":method",
)
```

## 在客户端级别设置

类似的，你可以在客户端级别为每个请求设置公共 Header:

```go
client := req.C()

client.
    SetCommonHeader("accept", "application/json").
    SetCommonHeaders(map[string]string{
        "my-custom-header": "My Custom Value",
        "user":             "imroc",
    }).
    SetCommonHeaderNonCanonical("my-Custom-header", "test").
    SetCommonHeadersNonCanonical(map[string]string{
        "my-Custom-Header": "test",
        "my-custom-header": "test",
    )

resp1, err := client.R().Get(url1)
...
resp2, err := client.R().Get(url2)
...
```

控制 header 顺序：

```go
client.SetCommonHeaderOrder(
    "custom-header",
    "cookie",
    "user-agent",
    "accept-encoding",
)

// pseudo-header is only used in http2 and http3
client.SetCommonPseudoHeaderOrder(
    ":scheme",
    ":authority",
    ":path",
    ":method",
)
```

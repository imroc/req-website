---
title: "指定 HTTP 版本"
description: "强制指定 HTTP 版本的方法"
draft: false
images: []
weight: 140
menu:
docs:
parent: "tutorial"
toc: true
---

## 默认行为

Req 同时支持 `HTTP/2` 和 `HTTP/1.1`，如果服务端支持，默认情况下首选 `HTTP/2`，这是由 TLS 握手协商的。

## 强制指定 HTTP 版本

如有必要，你可以强制指定使用 `HTTP/1.1`:

```go
client := req.C().EnableForceHTTP1().EnableDumpAllWithoutBody()
client.R().MustGet("https://httpbin.org/get")
```

```txt
GET /get HTTP/1.1
Host: httpbin.org
User-Agent: req/v3 (https://github.com/imroc/req)
Accept-Encoding: gzip

HTTP/1.1 200 OK
Date: Tue, 08 Feb 2022 02:30:18 GMT
Content-Type: application/json
Content-Length: 289
Connection: keep-alive
Server: gunicorn/19.9.0
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

如果你想要，也可以强制指定使用 `HTTP/2`，但是如果服务端不支持的话，将返回错误：

```go
client := req.C().EnableForceHTTP2()
client.R().MustGet("https://baidu.com")
```

```txt
panic: Get "https://baidu.com": server does not support http2, you can use http/1.1 which is supported
```

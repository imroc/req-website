---
title: "Force HTTP version"
description: "Force to set the HTTP version."
draft: false
images: []
weight: 140
menu:
docs:
parent: "tutorial"
toc: true
---

## Default behaviour

Req works fine both with `HTTP/2` and `HTTP/1.1`, `HTTP/2` is preferred by default if server support, which is negotiated by TLS handshake.

## Force HTTP version

You can force using `HTTP/1.1` if you want.

```go
client := req.C().EnableForceHTTP1().EnableDumpAllWithoutBody()
client.R().MustGet("https://httpbin.org/get")
```
```go
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

And also you can force using `HTTP/2` if you want, will return error if server does not support:

```go
client := req.C().EnableForceHTTP2()
client.R().MustGet("https://baidu.com")
```

```go
panic: Get "https://baidu.com": server does not support http2, you can use http/1.1 which is supported
```

Similarly, you can also force using `HTTP/3` if you want:

```go
client := req.C().EnableForceHTTP3()
client.R().MustGet("https://www.cloudflare.com")
```

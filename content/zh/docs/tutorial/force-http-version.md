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

Req 同时支持 `HTTP/1.1`，`HTTP/2` 和 `HTTP/3`，如果服务端支持，默认情况下首选 `HTTP/2`，其次 `HTTP/1.1`，这是由 TLS 握手协商的。如果启用了 HTTP3 (EnableHTTP3)，当探测到服务端支持 HTTP3，会使用 HTTP3 协议进行请求。

## 强制指定 HTTP 版本

如有必要，你可以强制指定使用 `HTTP/1.1`:

```go
client := req.C()
client.EnableForceHTTP1().EnableDumpAllWithoutBody()
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
client.EnableForceHTTP2()
client.R().MustGet("https://baidu.com")
```

```txt
panic: Get "https://baidu.com": server does not support http2, you can use http/1.1 which is supported
```

类似的, 你可以可以强制指定使用 `HTTP/3`:

```go
client.EnableForceHTTP3()
client.R().MustGet("https://www.cloudflare.com")
```

## HTTP2 与 H2C

当指定强制使用 HTTP2 时，在 http2 server 没有使用 TLS 时，可以启用 h2c (HTTP2 over TCP):

```go
client := req.C().DevMode().EnableForceHTTP2().EnableH2C()
client.R().MustGet("http://localhost:9000")
```

```txt
2022/08/24 21:38:04.630003 DEBUG [req] HTTP/2 GET http://localhost:9000/
:authority: localhost:8972
:method: GET
:path: /
:scheme: http
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 200
content-type: text/plain; charset=utf-8
content-length: 11
date: Wed, 24 Aug 2022 13:38:04 GMT

Hello World
```

h2c server 端示例代码:

```go
package main

import (
	"fmt"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"log"
	"net/http"
)

func main() {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "Hello World")
	})
	h2s := &http2.Server{}
	h1s := &http.Server{
		Addr:    ":9000",
		Handler: h2c.NewHandler(handler, h2s),
	}
	log.Fatal(h1s.ListenAndServe())
}
```

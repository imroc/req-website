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

Req works fine with `HTTP/1.1`, `HTTP/2` and `HTTP/3`. If supported by the server, `HTTP/2` is preferred by default, otherwise use `HTTP/1.1`, which is negotiated by the TLS handshake. If HTTP3 is enabled (EnableHTTP3), will use `HTTP/3` if it is detected that the server supports HTTP3.

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
client.EnableForceHTTP2()
client.R().MustGet("https://baidu.com")
```

```go
panic: Get "https://baidu.com": server does not support http2, you can use http/1.1 which is supported
```

Similarly, you can also force using `HTTP/3` if you want:

```go
client.EnableForceHTTP3()
client.R().MustGet("https://www.cloudflare.com")
```

## HTTP2 and H2C

If `EnableForceHTTP2`, h2c (HTTP2 over TCP) can be enabled when the http2 server does not use TLS:

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

Example code for h2c server:

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

---
title: "认证"
description: "介绍如何设置认证"
draft: false
images: []
weight: 270
menu:
  docs:
    parent: "tutorial"
toc: true
---

## 设置 Bearer Auth Token

使用 `SetBearerAuthToken` 可以在请求级别设置 Bearer Auth Token:

```go
client := req.C().EnableForceHTTP1().EnableDumpAllWithoutResponse()

client.R().
    SetBearerAuthToken("NGU1ZWYwZDJhNmZhZmJhODhmMjQ3ZDc4").
    Get("https://httpbin.org/get")
```

```txt
GET /get HTTP/1.1
Host: httpbin.org
User-Agent: req/v3 (https://github.com/imroc/req)
Authorization: Bearer NGU1ZWYwZDJhNmZhZmJhODhmMjQ3ZDc4
Accept-Encoding: gzip
```

使用 `SetCommonBearerAuthToken` 可以在客户端别设置 Bearer Auth Token:

```go
client := req.C().EnableForceHTTP1().EnableDumpAllWithoutResponse()

client.SetCommonBearerAuthToken("NGU1ZWYwZDJhNmZhZmJhODhmMjQ3ZDc4")
client.R().Get("https://httpbin.org/get")
```

```txt
GET /get HTTP/1.1
Host: httpbin.org
User-Agent: req/v3 (https://github.com/imroc/req)
Authorization: Bearer NGU1ZWYwZDJhNmZhZmJhODhmMjQ3ZDc4
Accept-Encoding: gzip
```

## 设置 Basic Auth

使用 `SetBasicAuth` 在请求级别设置 Basic Auth:

```go
client := req.C().EnableForceHTTP1().EnableDumpAllWithoutResponse()

client.R().
    SetBasicAuth("imroc", "123456").
    Get("https://httpbin.org/get")
```

```txt
GET /get HTTP/1.1
Host: httpbin.org
User-Agent: req/v3 (https://github.com/imroc/req)
Authorization: Basic aW1yb2M6MTIzNDU2
Accept-Encoding: gzip
```

使用 `SetCommonBasicAuth` 在客户端级别设置 Basic Auth:

```go
client := req.C().EnableForceHTTP1().EnableDumpAllWithoutResponse()

// Set basic auth for all request
client.SetCommonBasicAuth("imroc", "123456")

client.R().Get("https://httpbin.org/get")
```

```txt
GET /get HTTP/1.1
Host: httpbin.org
User-Agent: req/v3 (https://github.com/imroc/req)
Authorization: Basic aW1yb2M6MTIzNDU2
Accept-Encoding: gzip
```

## 设置 Digest Auth

HTTP 摘要认证是一种相比 Basic 认证更安全的认证方式，如果访问的 url 需要进行认证，服务端会响应 401 状态码，并通过 `WWW-Authentication` 这个响应头发送 Digest challenge 给客户端，客户端根据收到的 challenge 再结合用户名与密码生成合适的 `Authorization` 请求头，然后重新发送请求来通过认证。

更多关于 HTTP 摘要认证的内容可以查看 [RFC 7616](https://datatracker.ietf.org/doc/html/rfc7616)。

使用 `SetDigestAuth` 可以在请求级别设置 HTTP 摘要认证 (HTTP Digest Authentication):

```go
client := req.C().DevMode()

client.R().
    SetDigestAuth("roc", "123456").
    Get("https://httpbin.org/digest-auth/auth/imroc/123456")
```

```txt
2023/06/17 10:56:41.834437 DEBUG [req] HTTP/2 GET https://httpbin.org/digest-auth/auth/roc/123456
:authority: httpbin.org
:method: GET
:path: /digest-auth/auth/roc/123456
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 401
date: Sat, 17 Jun 2023 02:57:18 GMT
content-type: text/html; charset=utf-8
content-length: 0
server: gunicorn/19.9.0
www-authenticate: Digest realm="me@kennethreitz.com", nonce="def33b7ff7a1ab2b934f98cd7e2b7d6e", qop="auth", opaque="d5b8da0493c79eab8e8169812c622915", algorithm=MD5, stale=FALSE
set-cookie: stale_after=never; Path=/
set-cookie: fake=fake_value; Path=/
access-control-allow-origin: *
access-control-allow-credentials: true


2023/06/17 10:56:43.389555 DEBUG [req] HTTP/2 GET https://httpbin.org/digest-auth/auth/roc/123456
:authority: httpbin.org
:method: GET
:path: /digest-auth/auth/roc/123456
:scheme: https
authorization: Digest username="roc", realm="me@kennethreitz.com", nonce="def33b7ff7a1ab2b934f98cd7e2b7d6e", uri="/digest-auth/auth/roc/123456", response="4e6afd80797df771374903b8c52ed736", algorithm=MD5, opaque="d5b8da0493c79eab8e8169812c622915", qop=auth, nc=00000001, cnonce="7438ddbeb30b65f1b47e725256764102"
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 200
date: Sat, 17 Jun 2023 02:57:20 GMT
content-type: application/json
content-length: 46
server: gunicorn/19.9.0
set-cookie: fake=fake_value; Path=/
access-control-allow-origin: *
access-control-allow-credentials: true
```

使用 `SetCommonDigestAuth` 可以在客户端级别设置：

```go
client := req.C().SetCommonDigestAuth("roc", "123456")

client.R().Get("https://httpbin.org/digest-auth/auth/imroc/123456")
```

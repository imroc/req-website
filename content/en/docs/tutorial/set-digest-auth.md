---
title: "Set Digest Auth"
description: "This article will introduce how to set digest auth."
draft: false
images: []
weight: 270
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Introduction to HTTP Digest Authentication

HTTP Digest Authentication is a more secure authentication method than HTTP Basic Authentication. If the requested url needs to be authenticated, the server will respond with a 401 status code and send a Digest challenge to the client through the response header `WWW-Authentication`. The client need to generates an appropriate `Authorization` request header based on the received challenge combined with the username and password, and then resends the request to pass the authentication.

More information on HTTP Digest Authentication can be found in [RFC 7616](https://datatracker.ietf.org/doc/html/rfc7616).

## Request Level

HTTP Digest Authentication can be set at the request level using `SetDigestAuth`:

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

## Client Level

HTTP Digest Authentication can be set at the client level using `SetCommonDigestAuth`:

```go
client := req.C().SetCommonDigestAuth("roc", "123456")

client.R().Get("https://httpbin.org/digest-auth/auth/imroc/123456")
```

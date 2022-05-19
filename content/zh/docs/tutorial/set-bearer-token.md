---
title: "设置 Bearer Auth Token"
description: "This article will introduce how to set bearer token."
draft: false
images: []
weight: 266
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Request Level

Use `SetBearerAuthToken` at the request level:

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

## Client Level

Use `SetCommonBearerAuthToken` at the client level:

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

---
title: "设置 Bearer Auth Token"
description: "介绍如何设置 Bearer Auth Token"
draft: false
images: []
weight: 266
menu:
  docs:
    parent: "tutorial"
toc: true
---

## 在请求级别设置

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

## 在客户端级别设置

使用 `SetCommonBearerAuthToken` 可以在请求级别设置 Bearer Auth Token:

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

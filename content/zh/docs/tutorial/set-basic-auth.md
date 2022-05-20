---
title: "设置 Basic Auth"
description: "介绍如何设置 Basic Auth"
draft: false
images: []
weight: 264
menu:
  docs:
    parent: "tutorial"
toc: true
---

## 在请求级别设置

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

## 在客户端级别设置

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

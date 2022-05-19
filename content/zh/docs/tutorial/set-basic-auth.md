---
title: "设置 Basic Auth"
description: "This article will introduce how to set basic auth."
draft: false
images: []
weight: 264
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Request Level

Use `SetBasicAuth` at the request level:

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

## Client Level

Use `SetCommonBasicAuth` at the client level:

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

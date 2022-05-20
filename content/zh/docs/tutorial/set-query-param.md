---
title: "设置查询参数"
description: "介绍如何设置查询参数"
draft: false
images: []
weight: 160
menu:
  docs:
    parent: "tutorial"
toc: true
---


## 请求级别

使用 `SetQueryParam`, `SetQueryParams`, `SetQueryString` or `AddQueryParam` 在请求级别追加 URL 查询参数:

```go
client := req.C().EnableDebugLog().EnableDumpAllWithoutResponse()

client.R().
    SetQueryParam("a", "a").          // Set a query param, which will be encoded as query parameter in url
    SetQueryParams(map[string]string{ // Set multiple query params at once
        "b": "b",
        "c": "c",
    }).
    SetQueryString("d=d&e=e").      // Set query params as a raw query string
    AddQueryParam("key", "value1"). // Add query parameter with multiple values
    AddQueryParam("key", "value2").
    Post("https://httpbin.org/get")
```

```txt
2022/05/20 10:54:09.128183 DEBUG [req] HTTP/2 POST https://httpbin.org/get?a=a&b=b&c=c&d=d&e=e&key=value1&key=value2
:authority: httpbin.org
:method: POST
:path: /get?a=a&b=b&c=c&d=d&e=e&key=value1&key=value2
:scheme: https
content-length: 0
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)
```

## 客户端级别

类似的，使用 `SetCommonQueryParam`、`SetCommonQueryParams`、`SetCommonQueryString` 或 `AddCommonQueryParam` 可以在客户端级别追加 URL 查询参数，对所有请求生效：

```go
client.SetCommonQueryParam("a", "a").
    SetCommonQueryParams(map[string]string{
        "b": "b",
        "c": "c",
    }).
    SetCommonQueryString("d=d&e=e").
    AddCommonQueryParam("key", "value1").
    AddCommonQueryParam("key", "value2").

resp1, err := client.Get(url1)
...
resp2, err := client.Get(url2)
...
```

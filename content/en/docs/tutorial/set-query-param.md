---
title: "Set Query Parameter"
description: "This article will introduce how to set query parameters."
draft: false
images: []
weight: 160
menu:
  docs:
    parent: "tutorial"
toc: true
---


## Request Level

Use `SetQueryParam`, `SetQueryParams`, `SetQueryString` or `AddQueryParam` to append url query parameter at request-level:

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

## Client Level

Similarly, use `SetCommonQueryParam`, `SetCommonQueryParams`, `SetCommonQueryString` or `AddCommonQueryParam` to append url query parameter at client-level:

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

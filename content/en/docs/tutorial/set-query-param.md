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
client := req.C().DevMode()

client.R().
    SetQueryParam("a", "a"). // Set a query param, which will be encoded as query parameter in url
    SetQueryParams(map[string]string{ // Set multiple query params at once
        "b": "b",
        "c": "c",
    }).
    SetQueryString("d=d&e=e"). // Set query params as a raw query string
    AddQueryParam("key", "value1"). // Add query parameter with multiple values
    AddQueryParam("key", "value2").
    Get("https://api.github.com/repos/imroc/req/contents/README.md?x=x")
```

```txt
2022/05/17 17:22:12.817528 DEBUG [req] HTTP/2 GET https://api.github.com/repos/imroc/req/contents/README.md?x=x&a=a&b=b&c=c&d=d&e=e&key=value1&key=value2
...
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

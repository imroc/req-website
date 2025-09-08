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

```go
client := req.C().EnableDebugLog().EnableDumpAllWithoutResponse()

values := url.Values{}
values.Add("f", "f")
values.Add("g", "g")

type QueryParams struct {
  Name  string `url:"name"`
  Limit int    `url:"limit"`
}
params := QueryParams{
  Name:  "example",
  Limit: 10,
}

client.R().
  SetQueryParam("a", "a").          // Set a query param, which will be encoded as query parameter in url
  SetQueryParams(map[string]string{ // Set multiple query params at once
    "b": "b",
    "c": "c",
  }).
  SetQueryString("d=d&e=e").      // Set query params as a raw query string
  AddQueryParam("key", "value1"). // Add query params with multiple values
  AddQueryParam("key", "value2").
  SetQueryParamsFromValues(values). // Set query params from a url.Values
  SetQueryParamsFromStruct(params). // Set query params from a struct
  Get("https://httpbin.org/get")
```

```txt
2025/09/08 10:04:20.492326 DEBUG [req] HTTP/2 GET https://httpbin.org/get?a=a&b=b&c=c&d=d&e=e&f=f&g=g&key=value1&key=value2&limit=10&name=example
:authority: httpbin.org
:method: GET
:path: /get?a=a&b=b&c=c&d=d&e=e&f=f&g=g&key=value1&key=value2&limit=10&name=example
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)
```
## Client Level

Similarly, use `SetCommonQueryParam`, `SetCommonQueryParams`, `SetCommonQueryString`, `AddCommonQueryParam`, `SetQueryParamsFromValues` or `SetQueryParamsFromStruct` to append url query parameter at client-level:

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

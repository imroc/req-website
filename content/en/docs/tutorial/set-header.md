---
title: "Set Header"
description: "This article will introduce how to set header."
draft: false
images: []
weight: 220
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Request Level

Use `SetHeader` and `SetHeaders` to set http header at the request level:

```go
// Let's dump the header to see what's going on.
client := req.EnableDumpAllWithoutResponse().EnableForceHTTP1()

// Send a request with multiple headers.
client.R().
    SetHeader("accept", "application/json"). // Set one header
    SetHeaders(map[string]string{            // Set multiple headers at once
        "my-custom-header": "My Custom Value",
        "user":             "imroc",
    }).
    MustGet("https://httpbin.org/uuid")
```

```txt
GET /uuid HTTP/1.1
Host: httpbin.org
User-Agent: req/v3 (https://github.com/imroc/req)
Accept: application/json
My-Custom-Header: My Custom Value
User: imroc
Accept-Encoding: gzip
```

Use `SetHeaderNonCanonical` or `SetHeadersNonCanonical` if you want to keep case unchanged when backend server does not follow the `HTTP/1.1` specification "header names are case-insensitive" (see [RFC 2616 - 4.2 Message Headers](https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2)):

```go
// Let's dump the header to see what's going on.
client := req.EnableDumpAllWithoutResponse().EnableForceHTTP1()

client.R().
    SetHeaderNonCanonical("my-Custom-header", "test"). // Set Non-Canonical header in HTTP/1.1, keep case unchanged
    SetHeadersNonCanonical(map[string]string{          // Set multiple non-canonical headers at once
        "my-Custom-Header": "test",
        "my-custom-header": "test",
    }).
    MustGet("https://httpbin.org/uuid")
```

```txt
GET /uuid HTTP/1.1
Host: httpbin.org
User-Agent: req/v3 (https://github.com/imroc/req)
my-Custom-Header: test
my-Custom-header: test
my-custom-header: test
Accept-Encoding: gzip
```

## Client Level

Similarly, you can also set the common headers for every request at the client level.

```go
client := req.C()

client.
    SetCommonHeader("accept", "application/json").
    SetCommonHeaders(map[string]string{
        "my-custom-header": "My Custom Value",
        "user":             "imroc",
    }).
    SetCommonHeaderNonCanonical("my-Custom-header", "test").
    SetCommonHeadersNonCanonical(map[string]string{
        "my-Custom-Header": "test",
        "my-custom-header": "test",
    )

resp1, err := client.R().Get(url1)
...
resp2, err := client.R().Get(url2)
...
```

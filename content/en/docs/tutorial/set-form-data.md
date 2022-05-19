---
title: "Set Form Data"
description: "This article will introduce how to set form data."
draft: false
images: []
weight: 200
menu:
  docs:
    parent: "tutorial"
toc: true
---

> The form data of `GET`, `HEAD`, and `OPTIONS` requests will be ignored by default.

## Request Level

Use `SetFormData`:

```go
client := req.C().EnableDumpAllWithoutResponse()
client.R().SetFormData(map[string]string{
    "username": "imroc",
    "blog":     "https://imroc.cc",
}).Post("https://httpbin.org/post")
```

```txt
:authority: httpbin.org
:method: POST
:path: /post
:scheme: https
content-type: application/x-www-form-urlencoded
accept-encoding: gzip
user-agent: req/v2 (https://github.com/imroc/req)

blog=https%3A%2F%2Fimroc.cc&username=imroc
```

Use `SetFormDataFromValues` if you want to set multi value with the same key:

```go
// Multi value form data
v := url.Values{
    "multi": []string{"a", "b", "c"},
}
client.R().SetFormDataFromValues(v).Post("https://httpbin.org/post")
```

```txt
:authority: httpbin.org
:method: POST
:path: /post
:scheme: https
content-type: application/x-www-form-urlencoded
accept-encoding: gzip
user-agent: req/v2 (https://github.com/imroc/req)

multi=a&multi=b&multi=c
```

## Client Level

Similarly, You can also use `SetCommonFormData` or `SetCommonFormDataFromValues` to set form data at the client level:

```go
client.SetCommonFormData(m)
client.SetCommonFormDataFromValues(v)
```

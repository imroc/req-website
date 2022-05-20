---
title: "设置表单数据"
description: "介绍如何设置表单数据"
draft: false
images: []
weight: 200
menu:
  docs:
    parent: "tutorial"
toc: true
---

> 注意: `GET`, `HEAD`, 和 `OPTIONS` 类型的请求默认不允许设置表单数据。

## 在请求级别设置

使用 `SetFormData`:

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

如果想给同一个 key 设置多个 value，可以使用 `SetFormDataFromValues`:

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

## 在客户端级别设置

类似的, 你可以使用 `SetCommonFormData` 或 `SetCommonFormDataFromValues` 在客户端级别设置表单数据，对所有请求生效:

```go
client.SetCommonFormData(m)
client.SetCommonFormDataFromValues(v)
```

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

如果希望强制使用 multipart 方式提交表单，可以使用 `EnableForceMultipart`:

```go
client.R().
	EnableForceMultipart().
	SetFormData(map[string]string{
		"username": "imroc",
		"blog":     "https://imroc.cc",
	}).
	Post("https://httpbin.org/post")
```

```txt
:authority: httpbin.org
:method: POST
:path: /post
:scheme: https
content-type: multipart/form-data; boundary=1da8c513b38b0f8b0948bc37bb0de0d7afffd6ef1a5fd18daf62714c79e7
content-length: 317
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

--1da8c513b38b0f8b0948bc37bb0de0d7afffd6ef1a5fd18daf62714c79e7
Content-Disposition: form-data; name="username"

imroc
--1da8c513b38b0f8b0948bc37bb0de0d7afffd6ef1a5fd18daf62714c79e7
Content-Disposition: form-data; name="blog"

https://imroc.cc
--1da8c513b38b0f8b0948bc37bb0de0d7afffd6ef1a5fd18daf62714c79e7--
```

## 在客户端级别设置

类似的, 你可以使用 `SetCommonFormData` 或 `SetCommonFormDataFromValues` 在客户端级别设置表单数据，对所有请求生效:

```go
client.SetCommonFormData(m)
client.SetCommonFormDataFromValues(v)
```

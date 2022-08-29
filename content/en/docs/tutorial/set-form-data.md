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

> Note: the form data of `GET`, `HEAD`, and `OPTIONS` requests will be ignored by default.

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

If you want to force the form to be submitted using multipart, you can use `EnableForceMultipart`:

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

## Client Level

Similarly, You can also use `SetCommonFormData` or `SetCommonFormDataFromValues` to set form data at the client level:

```go
client.SetCommonFormData(m)
client.SetCommonFormDataFromValues(v)
```

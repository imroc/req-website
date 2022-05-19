---
title: "Quick HTTP Test"
description: "Test API with minimal code."
draft: false
images: []
weight: 120
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Test with Global Wrapper Methods

`req` wrap methods of both `Client` and `Request` with global methods, which is delegated to the default client behind the scenes, so you can just treat the package name `req` as a Client or Request to test quickly without create one explicitly.

```go
// Call the global methods just like the Client's method,
// so you can treat package name `req` as a Client, and
// you don't need to create any client explicitly.
client := req.SetTimeout(5 * time.Second).
	SetCommonBasicAuth("imroc", "123456").
	SetCommonHeader("Accept", "text/xml").
	SetUserAgent("my api client").
	DevMode()
```
```go
// Call the global method just like the Request's method,
// which will create request automatically using the default
// client, so you can treat package name `req` as a Request,
// and you don't need to create any request and client explicitly.
resp, err := req.SetQueryParam("page", "2").
	SetHeader("Accept", "application/json"). // Override client level settings at request level.
	Get("https://httpbin.org/get")
```

## Test with MustXXX

Use `MustXXX` to ignore error handling during test, make it possible to complete a complex test with just one line of code:

```go
fmt.Println(req.DevMode().R().MustGet("https://httpbin.org/get").TraceInfo())
```

---
title: "Create and Send Request"
description: "API for Creating and Sending Request"
draft: false
images: []
weight: 10020
menu:
  docs:
    parent: "ref"
toc: true
---

## Create Request

These methods of `Client` will create a new `Request`:

* [R()](https://pkg.go.dev/github.com/imroc/req/v3#Client.R)
* [NewRequest()](https://pkg.go.dev/github.com/imroc/req/v3#Client.NewRequest) - Alias of R.
* [Get(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Get) - Create request with GET method, URL is optional.
* [Post(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Post)
* [Head(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Head)
* [Delete(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Delete)
* [Put(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Put)
* [Patch(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Patch)
* [Options(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Options)


## Send Request

These methods of `Request` will fire the http request and return the response, `MustXXX` will not return any error, panic if error occurs.

* [Get(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Get)
* [Head(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Head)
* [Post(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Post)
* [Delete(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Delete)
* [Patch(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Patch)
* [Options(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Options)
* [Put(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Put)
* [MustGet(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.MustGet)
* [MustHead(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.MustHead)
* [MustPost(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.MustPost)
* [MustDelete(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.MustDelete)
* [MustPatch(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.MustPatch)
* [MustOptions(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.MustOptions)
* [MustPut(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.MustPut)
* [Send(method, url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Put) - Send request with given method name and url.
* [Do(ctx ...context.Context)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Do) - Send request with an optional context.

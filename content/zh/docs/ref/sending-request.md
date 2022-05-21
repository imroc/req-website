---
title: "发送请求"
description: "发送请求的 API 汇总"
draft: false
images: []
weight: 30
menu:
  docs:
    parent: "tutorial"
toc: true
---

`Request` 的以下这些方法会发起 HTTP 请求并返回响应。

> `MustXXX` 这种方法不会返回任何错误，如果发生错误就会 panic，适合测试 API 的时候用。

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
* [Send(method, url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Put) - 使用指定的 Method 和 URL 发送请求。

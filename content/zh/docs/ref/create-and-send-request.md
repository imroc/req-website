---
title: "发送请求"
description: "发送请求的 API 汇总"
draft: false
images: []
weight: 10020
menu:
  docs:
    parent: "ref"
toc: true
---

## 创建请求

`Client` 的以下这些方法会创建 HTTP 请求。

* [R()](https://pkg.go.dev/github.com/imroc/req/v3#Client.R)
* [NewRequest()](https://pkg.go.dev/github.com/imroc/req/v3#Client.NewRequest) - R 的别名.
* [Get(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Get) - 创建 GET 请求，URL 是可选的。
* [Post(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Post)
* [Head(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Head)
* [Delete(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Delete)
* [Put(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Put)
* [Patch(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Patch)
* [Options(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Options)

## 发送请求

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
* [Do(ctx ...context.Context)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Do) - 传入可选的 context 并发送请求。

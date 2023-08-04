---
title: "HTTP 指纹"
description: "介绍如何伪装 HTTP 指纹"
draft: false
images: []
weight: 605
menu:
  docs:
    parent: "tutorial"
toc: true
---

## 什么是 HTTP 指纹？

不同 HTTP 客户端实现有一些差异，在与服务端交互时有不同的特征，这些特征我们称为 HTTP 指纹，有些网站可能会通过检测 HTTP 指纹来鉴别客户端类型，然后对不同客户端响应不同内容，比较常见的是反爬虫技术，只允许正常的浏览器查看，爬虫程序无法正常获取内容。

如何让我们写的程序也能正常获取到启用了反爬技术的站点中的内容呢？那肯定是要想办法将自己伪装成浏览器，模拟浏览器的特征来发起 HTTP 请求（伪装 HTTP 指纹），骗过服务端的特征校验后就能像获取到跟浏览器一样的内容了。

## 如何伪装 HTTP 指纹？

我们如何伪装客户端的 HTTP 指纹，才能骗过服务端呢？

HTTP 指纹是由一系列特征构成的，服务端检查的特征越详细(反爬级别越高)，伪装的难度就越高，当然如果我们把所有特征全都伪装了，那就一定就能骗过服务端了。

常见的一些特征：
1. User-Agent 的值。
2. Header 及其排列顺序。
3. TLS 指纹，也就是TLS 握手时，客户端发送 ClientHello 的特征。包含客户端所支持的加密套件列表及其排列顺序、客户端支持的TLS版本、压缩方式、TLS extensions 列表及其排列顺序等。

对于 HTTP2，还有更多额外可以检查的特征：
1. HTTP2 settings 帧中的值列表及其排列顺序。
2. HTTP2 `WINDOW_UPDATE` 帧的值。
3. HTTP2 Priority 帧列表及其排列顺序。
4. 伪头（Pseudo-Header) 的顺序。
5. 请求头及其排列顺序，以及 header 帧中 flag 与 priority 选项的值。

## 使用 req 伪装 HTTP 指纹

大多数特征使用标准库 `net/http` 都无法模拟，而使用 `req` 请求库则很容易模拟，假如你想伪装成 Chrome 浏览器发起请求，直接调用 `Client` 的 `ImpersonateChrome()` 方法即可：

```go
client.ImpersonateChrome()
```

同理，伪装成 Firefox：

```go
client.ImpersonateFirefox()
```

## 如何验证 HTTP 指纹？

一些网站免费提供了验证 HTTP 指纹的能力，如：https://tls.peet.ws/api/all

使用 req 查看当前请求的指纹特征信息的示例：

```go
package main

import (
	"github.com/imroc/req/v3"
)

func main() {
	client := req.DevMode()
	client.ImpersonateChrome()
	client.R().MustGet("https://tls.peet.ws/api/all")
}
```

## 想要更多 HTTP 指纹伪装？

如果你对 HTTP 指纹做一些自定义，支持更多类型的 HTTP 指纹伪装，你可以参考已有的实现来做，如 `Client.ImpersonateFirefox()`。

---
title: "介绍"
description: "Req 是一个简单易用还带黑魔法的 Go HTTP 客户端，写更少的代码，获得更高的效率."
lead: "Req 是一个简单易用还带黑魔法的 Go HTTP 客户端，写更少的代码，获得更高的效率."
draft: false
images: []
weight: 10
menu:
  docs:
    parent: "prologue"
toc: true
---

## 特性

* 简单且在请求级别和客户端级别支持丰富的设置，均可使用链式调用的方法进行设置，请求级别可以覆盖客户端级别。
* 强大便捷的调试工具，包括调试日志、性能跟踪，甚至 dump 完整的请求和响应内容 (参考 [Debugging - Dump/Log/Trace](../../tutorial/debugging/)).
* 可以直接使用代码替代 curl 或 postman 等工具轻松进行 HTTP 测试，提供全局包装方法和 MustXXX 以用最少的代码测试 API (参考 [HTTP 快速测试](../../tutorial/quick-test/)).
* 同时支持 `HTTP/2` 和 `HTTP/1.1`，如果服务器支持，默认情况下首选 `HTTP/2`，如有需要，也可以强制指定 HTTP 版本 (参考 [强制指定 HTTP 版本](../../tutorial/force-http-version/)).
* 嗅探并自动解码成 UTF-8 以避免乱码 (参考 [自动解码](../../tutorial/auto-decode/)).
* 根据 Content-Type 自动 Marshal 请求体和 Unmarshal 响应体。
* Transport 是可导出的, 它支持 dump 请求内容，可以很容易与已有的 http.Client 集成，能以最少的代码改动获得 API 调试能力。
* 用很简单的设置就可以轻松进行上传和下载，甚至还支持设置回调来显示进度 (参考 [上传](../../tutorial/upload/) 和 [下载](../../tutorial/download/))。
* 轻松在请求级别或客户端级别设置请求头, cookie, URL 路径参数, 查询参数, 表单数据, Basic Auth, Bearer Token 等设置。
* 轻松设置客户端的超时时间，代理，证书，重定向策略，Cookie 存储，压缩，keepalive 等。
* 支持设置请求和响应的中间件，分别会在请求发出前和响应返回前执行 (参考 [请求和响应中间件](../../tutorial/middleware/)).
* 支持 HTTP 指纹伪装，这样我们就可以绕过通过识别 HTTP 指纹来禁止爬虫程序访问的网站（参考 [HTTP 指纹](../../tutorial/http-fingerprint/)）。
* 多种开箱即用的认证方式：HTTP Basic Auth、Bearer Auth Token 和 Digest Auth（参考 [认证](../../tutorial/authentication/)）。

## 许可证

`Req` 在 MIT 许可证下发布，参考  [LICENSE](https://github.com/imroc/req/blob/master/LICENSE) 文件。

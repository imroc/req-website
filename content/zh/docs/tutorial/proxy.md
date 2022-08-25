---
title: "代理"
description: "介绍如何设置代理"
draft: false
images: []
weight: 360
menu:
  docs:
    parent: "tutorial"
toc: true
---

## 默认行为

`Req` 默认使用 `http.ProxyFromEnvironment` 这个作为代理, 即会读取 `HTTP_PROXY/HTTPS_PROXY/http_proxy/https_proxy` 这些环境变量，如果有设置，就会将对应地址设置为代理地址。

## 设置代理

你也可以这样显式的设置代理:

```go
// Set http proxy from proxy url
client.SetProxyURL("http://myproxy:8080")

// Set socks5 proxy from proxy url
client.SetProxyURL("socks5://myproxy:1080")

// Custmize the proxy function with your own implementation
client.SetProxy(func(request *http.Request) (*url.URL, error) {
    // ...
})

// Disable proxy
client.SetProxy(nil)
```

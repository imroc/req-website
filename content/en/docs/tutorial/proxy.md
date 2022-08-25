---
title: "Proxy"
description: "This article will introduce how to set proxy."
draft: false
images: []
weight: 360
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Default Behaviour

`Req` use proxy `http.ProxyFromEnvironment` by default, which will read the `HTTP_PROXY/HTTPS_PROXY/http_proxy/https_proxy` environment variable, and setup proxy if environment variable is been set.

## Set Proxy

You can set proxy explicitly if you need:

```go
// Set proxy from proxy url
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

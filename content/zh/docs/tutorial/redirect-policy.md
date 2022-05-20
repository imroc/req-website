---
title: "重定向策略"
description: "介绍如何设置重定向策略"
draft: false
images: []
weight: 340
menu:
  docs:
    parent: "tutorial"
toc: true
---

可以使用 `SetRedirectPolicy` 为 `Client` 设置预定义的 `RedirectPolicy`，或者自定义的实现:

```go
client := req.C().DevMode()

client.SetRedirectPolicy(
    // Only allow up to 5 redirects
    req.MaxRedirectPolicy(5),
    // Only allow redirect to same domain.
    // e.g. redirect "www.imroc.cc" to "imroc.cc" is allowed, but "google.com" is not
    req.SameDomainRedirectPolicy(),
)

client.SetRedirectPolicy(
    // Only *.google.com/google.com and *.imroc.cc/imroc.cc is allowed to redirect
    req.AllowedDomainRedirectPolicy("google.com", "imroc.cc"),
    // Only allow redirect to same host.
    // e.g. redirect "www.imroc.cc" to "imroc.cc" is not allowed, only "www.imroc.cc" is allowed
    req.SameHostRedirectPolicy(),
)

// All redirect is not allowd
client.SetRedirectPolicy(req.NoRedirectPolicy())

// Or customize the redirect with your own implementation
client.SetRedirectPolicy(func(req *http.Request, via []*http.Request) error {
    // ...
})
```

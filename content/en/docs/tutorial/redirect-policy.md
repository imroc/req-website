---
title: "Redirect Policy"
description: "This article will introduce how to use redirect policy."
draft: false
images: []
weight: 340
menu:
  docs:
    parent: "tutorial"
toc: true
---

Use `SetRedirectPolicy` to set predefined `RedirectPolicy` or a customized one for the `Client`:

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

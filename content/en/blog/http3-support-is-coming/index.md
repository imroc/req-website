---
title: "HTTP3 support is coming!"
description: "HTTP3 support is coming, try it out!"
lead: ""
date: 2022-07-02T11:00:00+08:00
lastmod: 2022-07-02T11:00:00+08:00
draft: false
weight: 50
contributors: ["roc"]
---

![](http3.gif)

## Breaking News

Req is about to introduce HTTP3 support. In order to support HTTP3, the internal code of req has been refactored, and the code is currently submitted on a separate http3 branch. After it is stable enough, it will be merged into the master branch and then release version `v3.14.0`.

It will take some time before the official release, but now you can try it out in advance, this article will introduce how to use HTTP3 in req.

## Installation

If you want to enable HTTP3 support, ensure your go version is between go1.16 and go1.18, then you can use the below Go command to install req with HTTP3 support:

```bash
go get -u github.com/imroc/req/v3@http3
```

## Usage

Call client's `EnableHTTP3()`:

```go
package main

import (
  "github.com/imroc/req/v3"
)

func main() {
  req.EnableDebugLog().EnableHTTP3()
  // req.EnableDumpAll() // uncomment this to see all dump content.

  for i := 0; i < 4; i++ {
    req.MustGet("https://www.cloudflare.com")
  }
}
```

Check the debug log:

```
2022/07/02 10:37:52.876009 DEBUG [req] HTTP/2 GET https://www.cloudflare.com
2022/07/02 10:37:53.029690 DEBUG [req] HTTP/2 GET https://www.cloudflare.com
2022/07/02 10:37:53.122675 DEBUG [req] detected that the server www.cloudflare.com:443 supports http3, will try to use http3 protocol in subsequent requests
2022/07/02 10:37:53.171431 DEBUG [req] HTTP/3 GET https://www.cloudflare.com
2022/07/02 10:37:53.440928 DEBUG [req] HTTP/3 GET https://www.cloudflare.com
```

Let me explain: after enabling HTTP3, req will first normally initiate HTTP2 or HTTP/1.1 requests (TCP). During the requests, if it is detected that the server side supports HTTP3, all subsequent requests will use the HTTP3 protocol (UDP), which is the same as the browser's behavior.

---
title: "Easily Write Crawlers with Req"
description: "This article will introduce how to write crawlers with req"
lead: ""
draft: false
images: []
weight: 1008
menu:
  docs:
    parent: "examples"
toc: true
---

## Automatically Change IP When Request Fails (Set Proxy)

```go
var crawlerClient = NewAutoChangeProxyClient()
var proxies = []string{
  "http://proxy.example.com:8080",
  "https://proxy.example.com:9443",
  "socks5://proxy.example.com:1080",
}

func NewAutoChangeProxyClient() *req.Client {
  client := req.C()

  client.SetTimeout(5 * time.Second).
    EnableDumpEachRequest().
    SetCommonRetryCount(len(proxies)).
    SetCommonRetryCondition(func(resp *req.Response, err error) bool {
      return err != nil || resp.StatusCode == http.StatusTooManyRequests
    }).
    SetCommonRetryHook(func(resp *req.Response, err error) {
      c := client.Clone().SetProxyURL(proxies[resp.Request.RetryAttempt-1]) // Create a client with proxy
      resp.Request.SetClient(c)                                             // Change the client of request dynamically.
    })
  return client
}
```

## Parse HTML with goquery to Extract Content

```go
// Send request.
resp, err := crawlerClient.R().Get(url)
if err != nil {
  return err
}

// Pass resp.Body to goquery.
doc, err := goquery.NewDocumentFromReader(resp.Body)
if err != nil { // Append raw dump content to error message if goquery parse failed to help troubleshoot.
  return fmt.Errorf("failed to parse html: %s, raw content:\n%s", err.Error(), resp.Dump())
}

// Parse html content.
// ...
```

The complete example can be found here: [Integrate with goquery](../integrate-with-goquery/)。

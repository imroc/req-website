---
title: "使用 req 轻松写爬虫"
description: "介绍如何使用 req 轻松写出爬虫程序"
lead: ""
draft: false
images: []
weight: 1008
menu:
  docs:
    parent: "examples"
toc: true
---

## 请求失败自动更换 IP (设置代理)

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

## 结合 goquery 解析 html 抓取内容

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

完整示例参考 [与 goquery 集成](../integrate-with-goquery/)。

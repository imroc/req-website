---
title: "Integrate with goquery"
description: "This article will introduce how to integrate req with goquery"
lead: ""
draft: false
images: []
weight: 1500
menu:
  docs:
    parent: "examples"
toc: true
---

## Overview

[goquery](https://github.com/PuerkitoBio/goquery) is often used to write crawler programs in Go. This article gives an example of a crawler that is more robust and easier to troubleshoot by combining goquery and req.

## Code Example

```go
package main

import (
  "bytes"
  "errors"
  "fmt"
  "github.com/PuerkitoBio/goquery"
  "github.com/imroc/req/v3"
  "log"
  "strings"
)

var globalClient *req.Client

func init() {
  globalClient = req.C().EnableDumpEachRequest().
    OnAfterResponse(func(client *req.Client, resp *req.Response) error {
      // Treat non-successful responses as errors, record raw dump content in error message.
      if !resp.IsSuccess() { // Status code is not between 200 and 299.
        resp.Err = fmt.Errorf("bad response, raw content:\n%s", resp.Dump())
      }
      return nil
    })
}

func crawl(url string, callback func(doc *goquery.Document) error) error {
  // Send request.
  resp, err := globalClient.R().Get(url)
  if err != nil {
    return err
  }

  // Pass resp.Body to goquery.
  doc, err := goquery.NewDocumentFromReader(resp.Body)
  if err != nil { // Append raw dump content to error message if goquery parse failed to help troubleshoot.
    return fmt.Errorf("failed to parse html: %s, raw content:\n%s", err.Error(), resp.Dump())
  }
  err = callback(doc)
  if err != nil {
    err = fmt.Errorf("%s, raw content:\n%s", err.Error(), resp.Dump())
  }
  return err
}

func main() {
  // Crawl the weekly github trending page and print it out.
  err := crawl("https://github.com/trending?since=weekly", func(doc *goquery.Document) error {
    buf := new(bytes.Buffer)
    doc.Find(".Box .Box-row").Each(func(i int, s *goquery.Selection) {
      href, ok := s.Find("h1 a").First().Attr("href")
      if !ok || href == "" {
        return
      }
      repo := strings.TrimPrefix(href, "/")
      starsTotal := s.Find("div.f6 a").First().Text()
      starsWeek := s.Find("div.f6 span").Last().Text()

      starsTotal = strings.TrimSpace(starsTotal)
      starsWeek = strings.TrimSpace(starsWeek)

      buf.WriteString(fmt.Sprintf("No.%d %s\t%s stars total\t%s\n", i+1, repo, starsTotal, starsWeek))
    })
    if buf.Len() == 0 {
      return errors.New("failed to parse trending")
    }
    fmt.Println("GitHub Trending:")
    fmt.Println(buf.String())
    return nil
  })

  if err != nil {
    log.Fatal(err)
  }
```

* `EnableDumpEachRequest` is a convenient syntax sugar. It actually uses the Request middleware internally to enable dump separately for each request, temporarily store the dump content in memory, and call `Response.Dump()` to get it when needed.
* Use `OnAfterResponse` to add Response middleware, handle exceptions uniformly, consider abnormal responses (status codes not between 200 and 299) as errors, record the raw dump content into error, and throw it to the upper caller.
* Although the Body will be automatically read by default, `resp.Body` will be automatically restored and can be directly passed to goquery for parsing.
* If goquery reports an error in parsing html, it is usually due to github's own failure, or an exception to the proxy. At this time, the raw dump content will be printed out for troubleshooting.
* When the trending data is not parsed, it may be that the layout of the github UI has changed, and the raw dump content is recorded in the error for troubleshooting.
* This example only crawls one page. Since the middleware is used for unified exception handling for all requests, it is easy to extend the crawling of other pages, and only need to focus on business logic.

## Run and Result

```bash
$ go run .
GitHub Trending:
No.1 toeverything/AFFiNE        7,334 stars total       3,269 stars this week
No.2 dragonflydb/dragonfly      10,613 stars total      1,365 stars this week
No.3 novuhq/novu        7,488 stars total       2,432 stars this week
No.4 withastro/astro    16,101 stars total      2,688 stars this week
No.5 craftzdog/dotfiles-public  3,240 stars total       582 stars this week
No.6 punk-security/dnsReaper    788 stars total 466 stars this week
No.7 MatrixTM/MHDDoS    6,018 stars total       974 stars this week
No.8 moyix/fauxpilot    5,090 stars total       1,137 stars this week
No.9 duckdb/duckdb      5,926 stars total       222 stars this week
No.10 jina-ai/discoart  2,496 stars total       489 stars this week
No.11 pesser/stable-diffusion   607 stars total 173 stars this week
No.12 termux/termux-app 14,817 stars total      269 stars this week
No.13 TheAlgorithms/Python      142,155 stars total     1,076 stars this week
No.14 iptv-org/iptv     54,544 stars total      896 stars this week
No.15 ethereum/solidity 17,896 stars total      142 stars this week
No.16 facebook/folly    22,958 stars total      123 stars this week
No.17 pointfreeco/swift-composable-architecture 6,713 stars total       83 stars this week
No.18 actions/runner-images     6,410 stars total       69 stars this week
No.19 raysan5/raylib    10,367 stars total      135 stars this week
No.20 gofiber/fiber     21,691 stars total      365 stars this week
No.21 TeamNewPipe/NewPipe       20,417 stars total      349 stars this week
No.22 coder/coder       1,723 stars total       266 stars this week
No.23 MiCode/Xiaomi_Kernel_OpenSource   6,706 stars total       36 stars this week
No.24 utmapp/UTM        14,608 stars total      406 stars this week
No.25 bitwarden/server  10,260 stars total      53 stars this week
```

## Test for Exceptions

Try to modify the URL to trigger the content parsing exception, such as `https://www.baidu.com`, and then run it again to see the effect:

```bash
$ go run .
2022/08/16 20:55:16 failed to parse trending, raw content:
GET / HTTP/1.1
Host: www.baidu.com
User-Agent: req/v3 (https://github.com/imroc/req)
Accept-Encoding: gzip

HTTP/1.1 200 OK
Accept-Ranges: bytes
Cache-Control: no-cache
Connection: keep-alive
Content-Length: 227
Content-Type: text/html
Date: Tue, 16 Aug 2022 12:55:16 GMT
P3p: CP=" OTI DSP COR IVA OUR IND COM "
P3p: CP=" OTI DSP COR IVA OUR IND COM "
Pragma: no-cache
Server: BWS/1.1
Set-Cookie: BD_NOT_HTTPS=1; path=/; Max-Age=300
Set-Cookie: BIDUPSID=0021315124C1DCBD6D6542551E4524D3; expires=Thu, 31-Dec-37 23:55:55 GMT; max-age=2147483647; path=/; domain=.baidu.com
Set-Cookie: PSTM=1660654516; expires=Thu, 31-Dec-37 23:55:55 GMT; max-age=2147483647; path=/; domain=.baidu.com
Set-Cookie: BAIDUID=0021315124C1DCBD79E08683C3E42600:FG=1; max-age=31536000; expires=Wed, 16-Aug-23 12:55:16 GMT; domain=.baidu.com; path=/; version=1; comment=bd
Strict-Transport-Security: max-age=0
Traceid: 1660654516037233921014200821962745403164
X-Frame-Options: sameorigin
X-Ua-Compatible: IE=Edge,chrome=1

<html>
<head>
        <script>
                location.replace(location.href.replace("https://","http://"));
        </script>
</head>
<body>
        <noscript><meta http-equiv="refresh" content="0;url=http://www.baidu.com/"></noscript>
</body>
</html>
```

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
  "errors"
  "fmt"
  "github.com/PuerkitoBio/goquery"
  "github.com/imroc/req/v3"
  "log"
  "strings"
)

var globalClient *req.Client

func init() {
  globalClient = req.C().WrapRoundTripFunc(func(rt req.RoundTripper) req.RoundTripFunc {
    return func(req *req.Request) (resp *req.Response, err error) {
      // EnableDump at the request level in request middleware which dump content into
      // memory (not print to stdout), we can record dump content only when unexpected
      // exception occurs, it is helpful to troubleshoot problems in production.
      if req.RetryAttempt == 0 { // Ignore on retry, no need to repeat EnableDump.
        req.EnableDump()
      }

      resp, err = rt.RoundTrip(req)
      if err != nil {
        return
      }

      // Treat non-successful responses as errors, record raw dump content in error message.
      if !resp.IsSuccess() { // Status code is not between 200 and 299.
        err = fmt.Errorf("bad response, raw content:\n%s", resp.Dump())
      }
      return
    }
  })

}

func crawl(url string, callback func(doc *goquery.Document) error) error {
  // Send request.
  resp, err := globalClient.R().Get(url)
  if err != nil {
    log.Fatal(err)
  }

  // Pass resp.Body to goquery.
  doc, err := goquery.NewDocumentFromReader(resp.Body)
  if err != nil { // Append raw dump content to error message if goquery parse failed to help troubleshoot.
    msg := fmt.Sprintf("failed to parse html: %s", err.Error())
    if dump := resp.Dump(); dump != "" {
      msg += fmt.Sprintf(", raw content:\n%s", dump)
    }
    return errors.New(msg)
  }
  return callback(doc)
}

func main() {
  // Crawl the weekly github trending page and print it out.
  crawl("https://github.com/trending?since=weekly", func(doc *goquery.Document) error {
    fmt.Println("GitHub Trending:")
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

      fmt.Printf("No.%d %s\t%s stars total\t%s\n", i+1, repo, starsTotal, starsWeek)
    })
    return nil
  })
}
```

* Use the Client middleware to handle exceptions uniformly, consider abnormal responses (status codes not between 200 and 299) as errors, record the raw dump content into error, and throw it to the upper caller.
* Although the Body will be automatically read by default, `resp.Body` will be automatically restored and can be directly passed to goquery for parsing.
* If goquery reports an error in parsing html, it is usually due to github's own failure, or an exception to the proxy. At this time, the raw dump content will be printed out for troubleshooting.
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

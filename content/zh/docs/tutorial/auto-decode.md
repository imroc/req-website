---
title: "自动解码"
description: "This article will introduce how to auto decode."
draft: false
images: []
weight: 340
menu:
  docs:
    parent: "tutorial"
toc: true
---

## About Auto Decode

`Req` detect the charset of response body and decode it to utf-8 automatically to avoid garbled characters by default.

Its principle is to detect `Content-Type` header at first, if it's not the text content type (json, xml, html and so on), `req` will not try to decode. If it is, then `req` will try to find the charset information. And `req` also will try to sniff the body's content to determine the charset if the charset information is not included in the header, if sniffed out and not utf-8, then decode it to utf-8 automatically, and `req` will not try to decode if the charset is not sure, just leave the body untouched.

## Customization

You can disable auto decode if you don't need or care a lot about performance:

```go
client.DisableAutoDecode()
```

And also you can make some customization:

```go
// Try to auto-detect and decode all content types (some server may return incorrect Content-Type header)
client.SetAutoDecodeAllContentType()

// Only auto-detect and decode content which `Content-Type` header contains "html" or "json"
client.SetAutoDecodeContentType("html", "json")

// Or you can customize the function to determine whether to decode
fn := func(contentType string) bool {
    if regexContentType.MatchString(contentType) {
        return true
    }
    return false
}
client.SetAutoDecodeContentTypeFunc(fn)
```


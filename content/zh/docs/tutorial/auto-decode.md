---
title: "自动解码"
description: "介绍如何进行自动解码"
draft: false
images: []
weight: 340
menu:
  docs:
    parent: "tutorial"
toc: true
---

## 关于自动解码

默认情况下，`req` 会嗅探 HTTP 响应，如有需要会自动解码为 UTF-8 以避免乱码。

其原理是:
1. 首先检测 `Content-Type` 头，如果是文本内容类型（json、xml、html 等），`req` 会尝试解码，如果不是，则不会解码。
2. 如果没有 `Content-Type` 头，会提取响应体首部内容进行嗅探，如果嗅探出来明确不是 UTF-8，则自动解码为 UTF-8，如果字符集不确定，则不会尝试解码。

## 自定义

如果你不需要或担心自动解码影响性能，也可以关闭自动解码:

```go
client.DisableAutoDecode()
```

还可以进行更高级的自定义:

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


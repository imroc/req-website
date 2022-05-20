---
title: "Marshal 和 Unmarshal"
description: "介绍如何自定义 Marshal 和 Unmarshal"
draft: false
images: []
weight: 300
menu:
  docs:
    parent: "tutorial"
toc: true
---

## 默认行为

`Req` 默认使用标准库的 Marshal 和 Unmarshal 实现:
* 如果将 map 或 struct 传入 `Request.SetBody`, `Request.SetBodyJsonMarshal` or `Request.SetBodyXmlMarshal`，会使用 `json.Marshal` 或 `xml.Marshal` 来将请求体 Marshal 成指定编码格式的内容。
* 如果将 map 或 struct 传入 `Request.SetResult`, `Request.SetError` 或 `Response.Unmarshal`，会根据编码格式使用 `json.Unmarshal` 或 `xml.Unmarshal` 来响应体 Unmarshal 到传入的 map 或 struct 中。

## 自定义

你可以使用  `Client.SetJsonMarshal`, `Client.SetJsonUnmarshal`, `Client.SetXmlMarshal` 或 `Client.SetXmlUnmarshal` 来自定义 Marshal 和 Unmarshal 的实现:

```go
// Example of registering json-iterator
import jsoniter "github.com/json-iterator/go"

json := jsoniter.ConfigCompatibleWithStandardLibrary

client := req.C().
	SetJsonMarshal(json.Marshal).
	SetJsonUnmarshal(json.Unmarshal)

// Similarly, XML functions can also be customized
client.SetXmlMarshal(xmlMarshalFunc).SetXmlUnmarshal(xmlUnmarshalFunc)
```

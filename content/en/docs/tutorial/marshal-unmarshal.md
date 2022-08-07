---
title: "Customize Marshal and Unmarshal"
description: "This article will introduce how to customize the Marshal and Unmarshal function."
draft: false
images: []
weight: 300
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Default behaviour

`Req` uses the go standard library's marshal and unmarshal function by default:
* Use `json.Marshal` or `xml.Marshal` to marshal request body if you pass struct or map into `Request.SetBody`, `Request.SetBodyJsonMarshal` or `Request.SetBodyXmlMarshal`.
* Use `json.Unmarshal` or `xml.Unmarshal` to unmarshal response body if you pass struct or map into `Request.SetResult`, `Request.SetError` or `Response.Unmarshal`.

## Customization

You can customize the marshal function with `Client.SetJsonMarshal` or `Client.SetXmlMarshal` if you need more advanced customization:

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

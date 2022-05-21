---
title: "设置请求体"
description: "介绍如何设置请求体。"
draft: false
images: []
weight: 260
menu:
  docs:
    parent: "tutorial"
toc: true
---

## SetBody

使用 `SetBody` 来设置请求体，可以使用 `string`, `[]byte`, `io.Reader`, `req.GetContentFunc` 这些类型的参数，会自动进行类型断言来获取数据内容:

```go
// Create a client that dump request.
client := req.C().EnableDumpAllWithoutResponse()

// Send POST request with body.
client.R().SetBody("test").Post("https://httpbin.org/post")
```

```txt
:authority: httpbin.org
:method: POST
:path: /post
:scheme: https
content-type: text/plain; charset=utf-8
content-length: 4
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

test
```

如果参数不是上述类型，比如 `map` 和 `struct`，会自动等待并根据最后设置的 `Content-Type` 来将其 Marshal 成 JSON 或 XML 作为请求体内容，如果没设置，默认是 JSON:

```go
type User struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}
user := &User{Name: "imroc", Email: "roc@imroc.cc"}
client.R().SetBody(user).Post("https://httpbin.org/post")
```

```txt
:authority: httpbin.org
:method: POST
:path: /post
:scheme: https
content-type: application/json; charset=utf-8
accept-encoding: gzip
user-agent: req/v2 (https://github.com/imroc/req)

{"name":"imroc","email":"roc@imroc.cc"}
```

## SetBodyXXX

你可以使用更具体方法设置请求体，比如 `SetBodyJsonString`, `SetBodyJsonBytes`, `SetBodyXmlString` 和 `SetBodyXmlBytes`，这样可以避免类型断言，提高性能，同时也会自动设置 `Content-Type` 请求头:

```go
client.R().SetBodyJsonString(`{"username": "imroc"}`).Post("https://httpbin.org/post")
```

```txt
:authority: httpbin.org
:method: POST
:path: /post
:scheme: https
content-type: application/json; charset=utf-8
accept-encoding: gzip
user-agent: req/v2 (https://github.com/imroc/req)

{"username": "imroc"}
```

类似的, 使用 `SetBodyJsonMarshal` 或 `SetBodyXmlMarshal` 可以将请求体显式的 Marshal 成 JSON 或 XML，同样也会自动 `Content-Type` 请求头:

```go
cient.R().SetBodyXmlMarshal(user).Post("https://httpbin.org/post")
```

```txt
:authority: httpbin.org
:method: POST
:path: /post
:scheme: https
content-type: text/xml; charset=utf-8
accept-encoding: gzip
user-agent: req/v2 (https://github.com/imroc/req)

<User><Name>imroc</Name><Email>roc@imroc.cc</Email></User>
```

## 自定义 Marshal 实现

如果需要，`Req` 默认使用标准库的 `json.Marshal` 来将请求体 Marshal 成指定编码格式，你可以使用 `client.SetJsonMarshal` or `client.SetXmlMarshal` 来自定义 Marshal 的实现:

```go
// Example of registering json-iterator
import jsoniter "github.com/json-iterator/go"

json := jsoniter.ConfigCompatibleWithStandardLibrary

client := req.C()
client.SetJsonMarshal(json.Marshal).

// Similarly, XML functions can also be customized
client.SetXmlMarshal(xmlMarshalFunc)
```

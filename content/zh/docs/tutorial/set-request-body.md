---
title: "设置请求体"
description: "This article will introduce how to set body and marshal automatically, read body and unmarshal automatically."
draft: false
images: []
weight: 260
menu:
  docs:
    parent: "tutorial"
toc: true
---

## SetBody

Use `SetBody` to set request body, which accepts string, []byte, io.Reader, req.GetContentFunc, it uses type assertion to determine the data type of body automatically.

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

If it cannot determine, like map and struct, then it will wait and marshal to JSON or XML automatically according to the `Content-Type` header that have been set before or after, default to json if not set:

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

You can also use more specific methods such as `SetBodyJsonString`, `SetBodyJsonBytes`, `SetBodyXmlString` and `SetBodyXmlBytes` to avoid type assertions and improve performance,  and also set the `Content-Type` automatically without any guesswork:

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

Similarly, Use `SetBodyJsonMarshal` or `SetBodyXmlMarshal` methods can marshal body and set `Content-Type` automatically:

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

## Customize Marshal Function

`Req` uses `json.Marshal` of go standard library to marshal request body if needed, you can customize with `client.SetJsonMarshal` or `client.SetXmlMarshal`:

```go
// Example of registering json-iterator
import jsoniter "github.com/json-iterator/go"

json := jsoniter.ConfigCompatibleWithStandardLibrary

client := req.C()
client.SetJsonMarshal(json.Marshal).

// Similarly, XML functions can also be customized
client.SetXmlMarshal(xmlMarshalFunc)
```

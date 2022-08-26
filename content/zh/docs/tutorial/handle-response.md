---
title: "处理 Response"
description: "介绍如何处理 Response"
draft: false
images: []
weight: 145
menu:
  docs:
    parent: "tutorial"
toc: true
---

## 判断请求是否成功

要判断请求是否成功，首先要看是否发生 error:

```go
resp, err := client.R().Get(url)
if err != nil {
    log.Fatal(err)
}
```

如果用下面这种风格，也可以通过判断 `resp.Err` 来判断是否发生 error:

```go
resp := client.Get(url).Do()
if resp.Err != nil {
    log.Fatal(err)
}
```

> 任何情况下返回的 "resp" 永远不会是 nil，可以放心的直接判断。

如果没有发生 error，再判断状态码是否异常，一般状态码在 200~299 之间表示是成功响应，可以直接这样判断:

```go
if resp.IsSuccess() {
	...
}
```

状态码大于等于 400 时表示服务端响应了错误，可以直接这样判断:

```go
if resp.IsError() {
  ...
}
```

其它情况一般是不常见的未知异常。

通常建议使用中间件来统一对所有请求处理异常，避免重复代码，参考 [使用中间件统一处理异常](../../examples/handle-exceptions-with-middleware/)。

## req.Response 与 http.Response

请求发起后返回的是 `req.Response`，代表 HTTP 响应的结构体，里面嵌入了底层返回的原始的 `*http.Response`，所以我们可以直接在 `req.Response` 中访问 `http.Response` 中的字段，比如判断状态码时，可以将 `resp.Response.StatusCode` 简写为 `resp.StatusCode`:

```go
resp, err := client.R().Get(url)
if err != nil {
    log.Fatal(err)
}
if resp.StatusCode != http.StatusOK {
	...
}
```

当没发生 error 的时候，`resp.Response` 为 nil，这时如果仍要访问 `resp.StatusCode` 或 `resp.Header` 就会导致 panic，在没判断 error 时就想直接判断状态码或 Header，可以用 `resp.GetStatusCode()` 和 `resp.GetHeader(key)` 这种更安全的方法。

## 读取响应体内容为 string 或 []byte

你可以使用 `resp.String()` 或 `resp.Bytes()` 来获取被自动读到内存中的响应体内容，不会返回 error (参考 [自动读取响应体](#%E8%87%AA%E5%8A%A8%E8%AF%BB%E5%8F%96%E5%93%8D%E5%BA%94%E4%BD%93)):

```go
resp, err := client.R().Get(url)
if err != nil {
    log.Fatal(err)
}
body := resp.String()
fmt.Println("body:", body)
```

如果响应体没有被自动读到内存，可以使用 `resp.ToString()` or `resp.ToBytes()` 来获取 (读取出错的话会返回 error):

```go
body, err := resp.ToString()
if err != nil {
    log.Fatal(err)
}
fmt.Println("body:", body)
```

## Unmarshal 响应体

你可以调用 `Request` 的 `SetResult` 和 `SetError` 来让响应体自动 Unmarshal 到 struct 或 map 中去:

```go
resp, err := client.R().
    SetResult(&result).
    SetError(&errMsg).
    Get(url)
```

* 如果 `resp.IsSuccess()` 返回 true, 意味着响应状态码在 200~299 ，如果 err 是 nil，也表示响应体一定成功被 Unmarshal 到 `&result` 里了。
* 如果 `resp.IsError()` 返回 true，意味着响应状态码大于或等于 400，如果 err 是 nil，也表示响应体一定成功被 Unmarshal 到 `&errMsg` 里了。

通常我们可以这样处理响应:

```go
if err != nil { // Could be network error or unmarshal error
    // Handle error
    // ...
    return
}
if resp.IsSuccess() {
    name := result.Name
    // ...
}else if resp.IsError() {
    msg := errMsg.Message
    // ...
}else { // Bad status
    status := resp.Status
    // ...
}
```

你也可以使用 `resp.Unmarshal` 或 `resp.Into` 来显式的进行 Unmarshal:

```go
if resp.IsSuccess() {
    err = resp.Into(&user)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("%s's blog is %s\n", user.Name, user.Blog)
} else {
    fmt.Println("bad response:", resp)
}
```

不管是 `Request.SetResult`，`Request.SetError` 还是 `Response.Into`，都允许传入空指针的指针，当函数需要根据响应体来返回对应 struct 的指针时，可以直接将函数定义的返回值列表中的指针变量的地址传入(无需创建 struct，内部会自动使用反射来创建)，在封装 SDK 时尤为实用:

```go
func (c *GithubClient) GetMyProfile() (user *UserProfile, err error) {
	_, err = c.R().SetResult(&user).Get("/user")
	return
}
```

## 自动读取响应体

默认情况下，如果不是下载的请求，响应体会被自动读入内存，如有需要也可以选择禁用自动读取（通常不需要这样做）:

```go
client.DisableAutoReadResponse()

resp, err := client.R().Get(url)
if err != nil {
	log.Fatal(err)
}
io.Copy(dst, resp.Body)
```

## 结合 gjson 轻松获取 json 字段

如果返回的响应体是 json 格式，想要获取指定字段的值，但又不想定义 struct 去 Unmarshal 来获取字段的值，可以结合 [gjson](https://github.com/tidwall/gjson) 来获取指定字段的值。

代码示例:

```go
package main

import (
  "fmt"
  "github.com/imroc/req/v3"
  "github.com/tidwall/gjson"
)

type Response struct {
  *req.Response
}

func (resp Response) GetJsonStringField(path string) string {
  result := gjson.Get(resp.String(), path)
  return result.String()
}

func (resp Response) GetJsonStringArrayField(path string) (ret []string) {
  result := gjson.Get(resp.String(), path)
  for _, item := range result.Array() {
    ret = append(ret, item.String())
  }
  return ret
}

func main() {
  req.EnableDumpAllWithoutRequest()
  resp := Response{req.MustGet("https://httpbin.org/json")}

  topic := resp.GetJsonStringField("slideshow.title")
  slidesTitles := resp.GetJsonStringArrayField("slideshow.slides.#.title")

  fmt.Println("The topic is", topic)
  for i, title := range slidesTitles {
    fmt.Printf("Slide %d is %s\n", i+1, title)
  }
}
```

运行:

```txt
$ go run .
:status: 200
date: Fri, 26 Aug 2022 05:43:15 GMT
content-type: application/json
content-length: 429
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

{
  "slideshow": {
    "author": "Yours Truly",
    "date": "date of publication",
    "slides": [
      {
        "title": "Wake up to WonderWidgets!",
        "type": "all"
      },
      {
        "items": [
          "Why <em>WonderWidgets</em> are great",
          "Who <em>buys</em> WonderWidgets"
        ],
        "title": "Overview",
        "type": "all"
      }
    ],
    "title": "Sample Slide Show"
  }
}

The topic is Sample Slide Show
Slide 1 is Wake up to WonderWidgets!
Slide 2 is Overview
```

---
title: "读取响应内容"
description: "介绍如何读取响应内容"
draft: false
images: []
weight: 280
menu:
  docs:
    parent: "tutorial"
toc: true
---

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

## Unmarshal 响应体

你可以调用 `Request` 的 `SetResult` 和 `SetError` 来让响应体自动 Unmarshal 到 struct 或 map 中去:

```go
resp, err := client.R().
    SetResult(&result).
    SetError(&errMsg).
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

你也可以使用 `resp.Unmarshal` 来显式的进行 Unmarshal:

```go
if resp.IsSuccess() {
    err = resp.Unmarshal(user)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("%s's blog is %s\n", user.Name, user.Blog)
} else {
    fmt.Println("bad response:", resp)
}
```

## 获取原始的 http.Response

原始的 `http.Response` 被嵌入到了 req 的 `Response` 结构体, 所以你可以像访问原始的 `http.Response` 一样访问 req 的 `Response`:

```go
resp, err := req.Get("https://httpbin.org/get")
if err != nil {
    log.Fatal(err)
}
fmt.Println("status", resp.Status)
fmt.Println("server:", resp.Header.Get("server"))
fmt.Println("content-length:", resp.ContentLength)
```

```txt
status 200 OK
server: gunicorn/19.9.0
content-length: 289
```

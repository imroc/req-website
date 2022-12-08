---
title: "Cookie"
description: "介绍如何设置与管理 Cookie"
draft: false
images: []
weight: 240
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Cookie 自动管理

req 默认启用了 cookie 存储，当 server 返回的 header 中包含 `Set-Cookie` 时，req 默认会自动存储并在后续需要 cookie 的请求中自动带上 cookie 请求头。

如果需要禁用 cookie，可以这样做:

```go
client.SetCookieJar(nil)
```

如有需要，你也可以自定义 cookie 存储，比如希望将 cookie 持久化到文件，可以结合 [persistent-cookiejar](https://github.com/juju/persistent-cookiejar) 来用:

```go
package main

import (
  "github.com/imroc/req/v3"
  cookiejar "github.com/juju/persistent-cookiejar"
  "log"
)

var client *req.Client

func main() {
  jar, err := cookiejar.New(&cookiejar.Options{
    Filename: "cookies.json",
  })
  if err != nil {
    log.Fatalf("failed to create persistent cookiejar: %s\n", err.Error())
  }
  defer jar.Save()
  client = req.C().SetCookieJar(jar).DevMode()
  // ...
  client.R().MustGet("https://baidu.com")
  client.R().MustGet("https://github.com")
}
```

甚至可以传入自己写的 cookie 存储实现，比如将 cookie 写到 redis 或数据库实现跨 client 共享 cookie。

绝大多情况下你都不需要去手动设置 cookie，如确实有需要，可以参考下面的设置方法。

## 在请求级别手动设置

使用 `SetCookies` 可以在请求级别设置 Cookie:

```go
	// Let's dump the header to see what's going on
client := req.C().EnableDumpAllWithoutResponse()

cookie1 := &http.Cookie{
    Name:     "testcookie1",
    Value:    "testcookie1 value",
    Path:     "/",
    Domain:   "httpbin.org",
    MaxAge:   36000,
    HttpOnly: false,
    Secure:   true,
}
cookie2 := &http.Cookie{
    Name:     "testcookie2",
    Value:    "testcookie2 value",
    Path:     "/",
    Domain:   "httpbin.org",
    MaxAge:   36000,
    HttpOnly: false,
    Secure:   true,
}

// Send a request with multiple headers and cookies
client.R().
    SetCookies(cookie1, cookie2).
    Get("https://httpbin.org/get")

```

```txt
:authority: httpbin.org
:method: GET
:path: /get
:scheme: https
cookie: testcookie1="testcookie1 value"
cookie: testcookie2="testcookie2 value"
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)
```

也试试 `HTTP/1.1`:

```go
client.EnableForceHTTP1()

client.R().
    SetCookies(cookie1, cookie2).
    Get("https://httpbin.org/get")
```

```txt
GET /get HTTP/1.1
Host: httpbin.org
User-Agent: req/v3 (https://github.com/imroc/req)
Cookie: testcookie1="testcookie1 value"; testcookie2="testcookie2 value"
Accept-Encoding: gzip
```

## 在客户端级别手动设置

类似的，你可以使用 `SetCommonCookies` 在客户端级别为所有请求设置共同 Cookie:

```go
client.SetCommonCookies(cookie1, cookie2, cookie3)

resp1, err := client.R().Get(url1)
...
resp2, err := client.R().Get(url2)
```

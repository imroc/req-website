---
title: "设置 Cookie"
description: "介绍如何设置 Cookie"
draft: false
images: []
weight: 240
menu:
  docs:
    parent: "tutorial"
toc: true
---

## 在请求级别设置

使用 `SetCookies` 可以再请求级别设置 Cookie:

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

## 在客户端级别设置

类似的，你可以使用 `SetCommonCookies` 在客户端级别为所有请求设置共同 Cookie:

```go
client.SetCommonCookies(cookie1, cookie2, cookie3)

resp1, err := client.R().Get(url1)
...
resp2, err := client.R().Get(url2)
```

你也可以使用 `SetCookieJar` 自定义 `CookieJar`:

```go
// Set your own http.CookieJar implementation
client.SetCookieJar(jar)

// Set to nil to disable CookieJar
client.SetCookieJar(nil)
```

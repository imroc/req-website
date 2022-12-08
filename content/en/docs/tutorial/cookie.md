---
title: "Cookie"
description: "This article will introduce how to set and manage cookies."
draft: false
images: []
weight: 240
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Automatic Cookie Management

Req enables cookie storage by default. When the header returned by the server contains `Set-Cookie`, req will automatically store it by default and automatically set the cookie request header in subsequent requests that need it.

If you need to disable cookies, you can do this:

```go
client.SetCookieJar(nil)
```

If necessary, you can also customize the cookie storage, for example, if you want to persist the cookie to a file, you can use it in combination with [persistent-cookiejar](https://github.com/juju/persistent-cookiejar):

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

You can even pass in your own cookie storage implementation, such as writing cookies to redis or a database to share cookies across clients.

In most cases, you don't need to manually set cookies. If you really need it, you can refer to the setting method below.

## Manually Set at the Request Level

Use `SetCookies` to set http cookie for request at the request level:

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

Also try `HTTP/1.1`:

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

## Manually Set at the Client Level

Similarly, you can use `SetCommonCookies` to set the common cookies for every request at the client level:

```go
client.SetCommonCookies(cookie1, cookie2, cookie3)

resp1, err := client.R().Get(url1)
...
resp2, err := client.R().Get(url2)
```

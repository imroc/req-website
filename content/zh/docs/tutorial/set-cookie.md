---
title: "设置 Cookie"
description: "This article will introduce how to set cookie."
draft: false
images: []
weight: 240
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Request Level

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

## Client Level

Similarly, you can use `SetCommonCookies` to set the common cookies for every request at the client level:

```go
client.SetCommonCookies(cookie1, cookie2, cookie3)

resp1, err := client.R().Get(url1)
...
resp2, err := client.R().Get(url2)
```

You can also use `SetCookieJar` to customize the CookieJar at client level:

```go
// Set your own http.CookieJar implementation
client.SetCookieJar(jar)

// Set to nil to disable CookieJar
client.SetCookieJar(nil)
```

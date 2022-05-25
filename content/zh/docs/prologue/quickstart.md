---
title: "快速开始"
description: "基础用法指引"
draft: false
images: []
menu:
  docs:
    parent: "prologue"
weight: 20
toc: true
---

## 安装

1. 首先你需要安装 Go (版本要求在 1.15 及其以上), 然后用以下命令安装 req:

```bash
go get -u github.com/imroc/req/v3
```

2. 将 req 导入到你的代码:

```go
import "github.com/imroc/req/v3"
```

## 快速上手

```bash
# 假设以下代码是在 main.go 文件中
$ cat main.go
```

```go
package main

import (
    "github.com/imroc/req/v3"
)

func main() {
    req.DevMode()
    req.MustGet("https://httpbin.org/uuid")

    req.EnableForceHTTP1() // 强制 HTTP/1.1 看看效果
    req.MustGet("https://httpbin.org/uuid")
}
```

```bash
$ go run main.go
2022/05/19 10:05:07.920113 DEBUG [req] HTTP/2 GET https://httpbin.org/uuid
:authority: httpbin.org
:method: GET
:path: /uuid
:scheme: https
user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36
accept-encoding: gzip

:status: 200
date: Thu, 19 May 2022 02:05:08 GMT
content-type: application/json
content-length: 53
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

{
  "uuid": "bd519208-35d1-4483-ad9f-e1555ae108ba"
}

2022/05/19 10:05:09.340974 DEBUG [req] HTTP/1.1 GET https://httpbin.org/uuid
GET /uuid HTTP/1.1
Host: httpbin.org
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36
Accept-Encoding: gzip

HTTP/1.1 200 OK
Date: Thu, 19 May 2022 02:05:09 GMT
Content-Type: application/json
Content-Length: 53
Connection: keep-alive
Server: gunicorn/19.9.0
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true

{
  "uuid": "49b7f916-c6f3-49d4-a6d4-22ae93b71969"
}
```

以上示例代码非常适合快速测试，它使用全局包装方法直接调用 Client 和 Request 的方法(没有显式创建 Client 和 Request)，使用 `Client` 的 `DevMode()` 来查看请求详细信息，使用 `Request` 的 `MustGet` 发送 `GET` 请求而无需处理 error。

在生产环境，建议显式创建一个客户端，然后使用同一个客户端发送所有请求，请接着看下面其它的示例。

## 简单的 GET 请求

```go
package main

import (
	"fmt"
	"github.com/imroc/req/v3"
	"log"
)

func main() {
	client := req.C() // Use C() to create a client.
	resp, err := client.R(). // Use R() to create a request.
		Get("https://httpbin.org/uuid")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(resp)
}
```

```txt
{
  "uuid": "a4d4430d-0e5f-412f-88f5-722d84bc2a62"
}
```

## 高级的 GET 请求

```go
package main

import (
  "fmt"
  "github.com/imroc/req/v3"
  "log"
  "time"
)

type ErrorMessage struct {
  Message string `json:"message"`
}

type UserInfo struct {
  Name string `json:"name"`
  Blog string `json:"blog"`
}

func main() {
  client := req.C().
    SetUserAgent("my-custom-client"). // Chainable client settings.
    SetTimeout(5 * time.Second)

  var userInfo UserInfo
  var errMsg ErrorMessage
  resp, err := client.R().
    SetHeader("Accept", "application/vnd.github.v3+json"). // Chainable request settings
    SetPathParam("username", "imroc").
    SetResult(&userInfo). // Unmarshal response body into userInfo automatically if status code is between 200 and 299.
    SetError(&errMsg). // Unmarshal response body into errMsg automatically if status code >= 400.
    EnableDump(). // Enable dump at request level, only print dump content if there is an error or some unknown situation occurs to help troubleshoot.
    Get("https://api.github.com/users/{username}")

  if err != nil { // Error handling.
    log.Println("error:", err)
    log.Println("raw content:")
    log.Println(resp.Dump()) // Record raw content when error occurs.
    return
  }

  if resp.IsError() { // Status code >= 400.
    fmt.Println(errMsg.Message) // Record error message returned.
    return
  }

  if resp.IsSuccess() { // Status code is between 200 and 299.
    fmt.Printf("%s (%s)\n", userInfo.Name, userInfo.Blog)
    return
  }

  // Unknown status code.
  log.Println("unknown status", resp.Status)
  log.Println("raw content:")
  log.Println(resp.Dump()) // Record raw content when server returned unknown status code.
}
```

正常情况下输出:

```txt
roc (https://imroc.cc)
```

## 基础 POST 请求

```go
package main

import (
  "fmt"
  "github.com/imroc/req/v3"
  "log"
)

type Repo struct {
  Name string `json:"name"`
  Url  string `json:"url"`
}

type Result struct {
  Data string `json:"data"`
}

func main() {
  client := req.C().DevMode()
  var result Result

  resp, err := client.R().
    SetBody(&Repo{Name: "req", Url: "https://github.com/imroc/req"}).
    SetResult(&result).
    Post("https://httpbin.org/post")
  if err != nil {
    log.Fatal(err)
  }

  if !resp.IsSuccess() {
    fmt.Println("bad response status:", resp.Status)
    return
  }
  fmt.Println("++++++++++++++++++++++++++++++++++++++++++++++++")
  fmt.Println("data:", result.Data)
  fmt.Println("++++++++++++++++++++++++++++++++++++++++++++++++")
}}
```

```txt
2022/05/19 20:11:00.151171 DEBUG [req] HTTP/2 POST https://httpbin.org/post
:authority: httpbin.org
:method: POST
:path: /post
:scheme: https
user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36
content-type: application/json; charset=utf-8
content-length: 55
accept-encoding: gzip

{"name":"req","website":"https://github.com/imroc/req"}

:status: 200
date: Thu, 19 May 2022 12:11:00 GMT
content-type: application/json
content-length: 651
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

{
  "args": {},
  "data": "{\"name\":\"req\",\"website\":\"https://github.com/imroc/req\"}",
  "files": {},
  "form": {},
  "headers": {
    "Accept-Encoding": "gzip",
    "Content-Length": "55",
    "Content-Type": "application/json; charset=utf-8",
    "Host": "httpbin.org",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
    "X-Amzn-Trace-Id": "Root=1-628633d4-7559d633152b4307288ead2e"
  },
  "json": {
    "name": "req",
    "website": "https://github.com/imroc/req"
  },
  "origin": "103.7.29.30",
  "url": "https://httpbin.org/post"
}

++++++++++++++++++++++++++++++++++++++++++++++++
data: {"name":"req","url":"https://github.com/imroc/req"}
++++++++++++++++++++++++++++++++++++++++++++++++
```

## 视频

* [Get Started With Req](https://www.youtube.com/watch?v=k47i0CKBVrA) (English, Youtube)
* [快速上手 req](https://www.bilibili.com/video/BV1Xq4y1b7UR) (Chinese, BiliBili)

## 学习更多用法

类似的，你可以使用 `req` 轻松发起各种 `GET`, `POST`, `PATCH`, `PUT`, `HEAD`, `DELETE` 与 `OPTIONS` 等请求，请参阅 **使用教程** 中的系列文章来学习更多用法。

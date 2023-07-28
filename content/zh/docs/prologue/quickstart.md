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

1. 首先你需要安装 Go (版本要求在 1.20 及其以上), 然后用以下命令安装 req:

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
    req.DevMode() // 将包名视为 Client 直接调用，启用开发模式
    req.MustGet("https://httpbin.org/uuid") // 将包名视为 Request 直接调用，发起 GET 请求

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
user-agent: req/v3 (https://github.com/imroc/req/v3)
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
User-Agent: req/v3 (https://github.com/imroc/req/v3)
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
    SetSuccessResult(&userInfo). // Unmarshal response body into userInfo automatically if status code is between 200 and 299.
    SetErrorResult(&errMsg). // Unmarshal response body into errMsg automatically if status code >= 400.
    EnableDump(). // Enable dump at request level, only print dump content if there is an error or some unknown situation occurs to help troubleshoot.
    Get("https://api.github.com/users/{username}")

  if err != nil { // Error handling.
    log.Println("error:", err)
    log.Println("raw content:")
    log.Println(resp.Dump()) // Record raw content when error occurs.
    return
  }

  if resp.IsErrorState() { // Status code >= 400.
    fmt.Println(errMsg.Message) // Record error message returned.
    return
  }

  if resp.IsSuccessState() { // Status code is between 200 and 299.
    fmt.Printf("%s (%s)\n", userInfo.Name, userInfo.Blog)
    return
  }

  // Unknown status code.
  log.Println("unknown status", resp.Status)
  log.Println("raw content:")
  log.Println(resp.Dump()) // Record raw content when server returned unknown status code.
}
```

正常情况下输出 (SuccessState):

```txt
roc (https://imroc.cc)
```

## 更高级的 GET 请求

可以在 client 上设置错误的统一处理逻辑，每次发请求时只需关注成功的情况，减少重复代码。

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

func (msg *ErrorMessage) Error() string {
	return fmt.Sprintf("API Error: %s", msg.Message)
}

type UserInfo struct {
	Name string `json:"name"`
	Blog string `json:"blog"`
}

var client = req.C().
	SetUserAgent("my-custom-client"). // Chainable client settings.
	SetTimeout(5 * time.Second).
	EnableDumpEachRequest().
	SetCommonErrorResult(&ErrorMessage{}).
	OnAfterResponse(func(client *req.Client, resp *req.Response) error {
		if resp.Err != nil { // There is an underlying error, e.g. network error or unmarshal error.
			return nil
		}
		if errMsg, ok := resp.ErrorResult().(*ErrorMessage); ok {
			resp.Err = errMsg // Convert api error into go error
			return nil
		}
		if !resp.IsSuccessState() {
			// Neither a success response nor a error response, record details to help troubleshooting
			resp.Err = fmt.Errorf("bad status: %s\nraw content:\n%s", resp.Status, resp.Dump())
		}
		return nil
	})

func main() {
	var userInfo UserInfo
	resp, err := client.R().
		SetHeader("Accept", "application/vnd.github.v3+json"). // Chainable request settings
		SetPathParam("username", "imroc").
		SetSuccessResult(&userInfo). // Unmarshal response body into userInfo automatically if status code is between 200 and 299.
		Get("https://api.github.com/users/{username}")

	if err != nil { // Error handling.
		log.Println("error:", err)
		return
	}

	if resp.IsSuccessState() { // Status code is between 200 and 299.
		fmt.Printf("%s (%s)\n", userInfo.Name, userInfo.Blog)
	}
}
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
    SetSuccessResult(&result).
    Post("https://httpbin.org/post")
  if err != nil {
    log.Fatal(err)
  }

  if !resp.IsSuccessState() {
    fmt.Println("bad response status:", resp.Status)
    return
  }
  fmt.Println("++++++++++++++++++++++++++++++++++++++++++++++++")
  fmt.Println("data:", result.Data)
  fmt.Println("++++++++++++++++++++++++++++++++++++++++++++++++")
}
```

```txt
2022/05/19 20:11:00.151171 DEBUG [req] HTTP/2 POST https://httpbin.org/post
:authority: httpbin.org
:method: POST
:path: /post
:scheme: https
user-agent: req/v3 (https://github.com/imroc/req/v3)
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
    "User-Agent": "req/v3 (https://github.com/imroc/req/v3)",
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

## Do API 风格

如果你喜欢，你也可以使用类似下面可读性更高的 Do API 风格来发起请求:

```go
package main

import (
  "fmt"
  "github.com/imroc/req/v3"
)

type APIResponse struct {
  Origin string `json:"origin"`
  Url    string `json:"url"`
}

func main() {
  var resp APIResponse
  c := req.C()
  err := c.Post("https://httpbin.org/post"). // method + url
    SetBody("hello"). // set request body
    Do(). // send request
    Into(&resp) // unmarshal response body
  if err != nil {
    panic(err)
  }
  fmt.Println("My IP is", resp.Origin)
}
```

```txt
My IP is 182.138.155.113
```

* 链式调用的顺序更直观：先调用 Client 创建一个指定 Method 的请求，然后对请求使用链式调用进行设置，再使用 `Do()` 发起请求，返回 Response，最后再调用 `Response.Into` 进行 Unmarshal。
* 如果在请求期间发生 error 或 Unmarshal 时发生 error，最终 `Response.Into` 都会返回 error。
* 有些 API 的 url 是固定的，通过传不同 body 来实现不同类型的请求，这种场景可实现使用 `Client.SetBaseURL` 设置统一的 url，在发起请求时就无需为每个请求都设置 url，当然，如果你需要也可以调用 `Request.SetURL` 来设置。

## 使用 req 封装 SDK

以下是通过 req 封装 GitHub 的 SDK 示例，分别使用两种风格对接 API (`GetUserProfile_Style1`, `GetUserProfile_Style2`)。

```go
import (
	"context"
	"fmt"
	"github.com/imroc/req/v3"
)

type ErrorMessage struct {
	Message string `json:"message"`
}

// Error implements go error interface.
func (msg *ErrorMessage) Error() string {
	return fmt.Sprintf("API Error: %s", msg.Message)
}

type GithubClient struct {
	*req.Client
}

func NewGithubClient() *GithubClient {
	return &GithubClient{
		Client: req.C().
			SetBaseURL("https://api.github.com").
			SetCommonErrorResult(&ErrorMessage{}).
			EnableDumpEachRequest().
			OnAfterResponse(func(client *req.Client, resp *req.Response) error {
				if resp.Err != nil { // There is an underlying error, e.g. network error or unmarshal error.
					return nil
				}
				if errMsg, ok := resp.ErrorResult().(*ErrorMessage); ok {
					resp.Err = errMsg // Convert api error into go error
					return nil
				}
				if !resp.IsSuccessState() {
					// Neither a success response nor a error response, record details to help troubleshooting
					resp.Err = fmt.Errorf("bad status: %s\nraw content:\n%s", resp.Status, resp.Dump())
				}
				return nil
			}),
	}
}

type UserProfile struct {
	Name string `json:"name"`
	Blog string `json:"blog"`
}

// GetUserProfile_Style1 returns the user profile for the specified user.
// Github API doc: https://docs.github.com/en/rest/users/users#get-a-user
func (c *GithubClient) GetUserProfile_Style1(ctx context.Context, username string) (user *UserProfile, err error) {
	_, err = c.R().
		SetContext(ctx).
		SetPathParam("username", username).
		SetSuccessResult(&user). // pointer's pointer, will create and unmarshalled into a UserProfile struct automatically.
		Get("/users/{username}")
	return
}

// GetUserProfile_Style2 returns the user profile for the specified user.
// Github API doc: https://docs.github.com/en/rest/users/users#get-a-user
func (c *GithubClient) GetUserProfile_Style2(ctx context.Context, username string) (user *UserProfile, err error) {
	err = c.Get("/users/{username}").
		SetPathParam("username", username).
		Do(ctx).
		Into(&user) // pointer's pointer, will create and unmarshalled into a UserProfile struct automatically.
	return
}
```

## 视频

以下是 req 的系列视频教程:

* [BiliBili 播放列表](https://www.bilibili.com/video/BV14t4y1J7cm)
* [Youtube 播放列表](https://www.youtube.com/watch?v=Dy8iph8JWw0&list=PLnW6i9cc0XqlhUgOJJp5Yf1FHXlANYMhF&index=2)

## 学习更多用法

类似的，你可以使用 `req` 轻松发起各种 `GET`, `POST`, `PATCH`, `PUT`, `HEAD`, `DELETE` 与 `OPTIONS` 等请求，请参阅 **使用教程** 中的系列文章来学习更多用法。

## 贡献

如果你想反馈 bug 或提出新特性，你可以 [创建 Issue](https://github.com/imroc/req/issues/new), 另外也欢迎 [提交 PR](https://github.com/imroc/req/pulls)。

## 联系方式

如果你有问题，欢迎通过以下方式联系我们：

* [Github Discussion](https://github.com/imroc/req/discussions)
* [Slack](https://imroc-req.slack.com/archives/C03UFPGSNC8) | [加入](https://slack.req.cool/)
* QQ 群: 621411351 - <a href="https://qm.qq.com/cgi-bin/qm/qr?k=P8vOMuNytG-hhtPlgijwW6orJV765OAO&jump_from=webapi"><img src="https://pub.idqqimg.com/wpa/images/group.png"></a>

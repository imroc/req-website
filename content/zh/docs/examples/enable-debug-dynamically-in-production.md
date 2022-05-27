---
title: "在生产环境动态开启 Debug"
description: "介绍在生产环境如何通过 API 或信号动态开启 Debug"
lead: ""
draft: false
images: []
weight: 1005
menu:
  docs:
    parent: "examples"
toc: true
---

在生产环境中，我们经常可能会有服务间的HTTP调用，API异常时，往往在测试环境中不好复现，我们往往希望能在生产环境中直接调试，本文给出使用 `req` 在生产环境中动态开启 Debug 来辅助我们定位问题示例。

## 通过 API 调用开启 Debug

服务端提供 `/debug` 的 API，当请求 `/debug?enable=true` 时动态开启 Debug，请求 `/debug?enable=false` 动态关闭 Debug:

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/imroc/req/v3"
	"time"
)

var globalClient = req.C()

func main() {
	go func() {
    gin.SetMode(gin.ReleaseMode)
		r := gin.New()
		r.GET("/debug", func(c *gin.Context) {
			query := c.Query("enable")
			switch query {
			case "true": // Turn on dump with `curl 127.0.0.1:80/dump?enable=true`
				globalClient.EnableDumpAll()
				globalClient.EnableDebugLog()
				fmt.Println("Debug is enabled")
			case "false": // Turn off dump with `curl 127.0.0.1:80/dump?enable=false`
				globalClient.DisableDumpAll()
				globalClient.DisableDebugLog()
				fmt.Println("Debug is disabled")
			}
		})
		r.Run("0.0.0.0:80")
	}()

	for {
		time.Sleep(5 * time.Second)

		var result struct {
			Uuid string `json:"uuid"`
		}

		resp, err := globalClient.R().
			SetResult(&result). // Read uuid response into struct.
			Get("https://httpbin.org/uuid")

		if err != nil {
			fmt.Println("ERROR:", err.Error())
			continue
		}

		if resp.IsSuccess() { // Print uuid returned by the API.
			fmt.Println(result.Uuid)
		} else {
			fmt.Println("bad status", resp.Status)
		}
	}
}
```

编译并运行起来:

```bash
$ go build -o test
$ ./test
6478d352-88c6-48f3-a481-4c355107fb03
2323dbab-342e-4dfa-8a93-f22e1a7037e8
3dc8f364-ed26-4e7b-887e-c808fc534df1
```

使用 `curl 'http://127.0.0.1:80/debug?enable=true'` 开启 Debug，然后看看输出的变化：

```txt
Debug is enabled
2022/05/25 19:51:13.740297 DEBUG [req] HTTP/2 GET https://httpbin.org/uuid
:authority: httpbin.org
:method: GET
:path: /uuid
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 200
date: Wed, 25 May 2022 11:51:13 GMT
content-type: application/json
content-length: 53
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

{
  "uuid": "66c361ab-dadb-4377-97f0-6aff0bbae49e"
}

66c361ab-dadb-4377-97f0-6aff0bbae49e
```

使用 `curl 'http://127.0.0.1:80/debug?enable=false'` 关闭 Debug，再看看输出的变化：

```txt
Debug is disabled
5d88b365-b137-463a-ba42-cf1c59b15d24
af96df78-bf6f-4c6c-b98d-427abc13ae03
```

## 通过 Signal 开启 Debug

```go
package main

import (
	"fmt"
	"github.com/imroc/req/v3"
	"os"
	"os/signal"
	"syscall"
	"time"
)

var globalClient = req.C()

func main() {
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGUSR1, syscall.SIGUSR2)

	go func() {
		for sig := range sigs {
			switch sig {
			case syscall.SIGUSR1: // Enable debug by `kill -SIGUSR1 PID`
				globalClient.EnableDumpAll()
				globalClient.EnableDebugLog()
				fmt.Println("Debug is enabled")
			case syscall.SIGUSR2: // Disable debug by `kill -SIGUSR2 PID`
				globalClient.DisableDumpAll()
				globalClient.DisableDebugLog()
				fmt.Println("Debug is disabled")
			}
		}
	}()

	for {
		time.Sleep(5 * time.Second)

		var result struct {
			Uuid string `json:"uuid"`
		}

		resp, err := globalClient.R().
			SetResult(&result). // Read uuid response into struct.
			Get("https://httpbin.org/uuid")

		if err != nil {
			fmt.Println("ERROR:", err.Error())
			continue
		}

		if resp.IsSuccess() { // Print uuid returned by the API.
			fmt.Println(result.Uuid)
		} else {
			fmt.Println("bad status", resp.Status)
		}
	}
}
```

编译并运行:

```bash
$ go build -o test
$ ./test
3559ef3f-4a9e-4d08-969e-c92f5f8cd284
733d03b8-d680-4d65-aefc-27fb30e591c9
40af3a84-867e-4d2d-9cdb-aa1a16a52471
```

使用 `kill -SIGUSR1 PID` 开启 Debug，然后看看输出的变化：

```txt
Debug is enabled
2022/05/25 11:36:50.801032 DEBUG [req] HTTP/2 GET https://httpbin.org/uuid
:authority: httpbin.org
:method: GET
:path: /uuid
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 200
date: Wed, 25 May 2022 03:36:51 GMT
content-type: application/json
content-length: 53
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

{
  "uuid": "733d03b8-d680-4d65-aefc-27fb30e591c9"
}

733d03b8-d680-4d65-aefc-27fb30e591c9
```

使用 `kill -SIGUSR2 PID` 关闭 Debug，再看看输出的变化:

```txt
Debug is disabled
90b7648f-b195-44d4-80e4-7ab84a0b06b8
dd193d44-f0e6-40c4-b804-a36b5890a048
df0d8c10-1615-4b5f-b444-1453a7b0128b
```

## 只对部分匹配的请求开启 Debug

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/imroc/req/v3"
	"strings"
	"time"
)

var debugKeyword string

var globalClient = req.OnBeforeRequest(func(c *req.Client, r *req.Request) error {
	r.EnableDump() // Enable dump at the request level for all requests.
	return nil
}).OnAfterResponse(func(c *req.Client, resp *req.Response) error {
	if !resp.IsSuccess() { // Dump and record unexpected response as error.
		return fmt.Errorf("bad response from %s %s, dump content:\n%s", resp.Request.Method, resp.Request.RawURL, resp.Dump())
	}

	// Conditional Debugging: Only display the dump content whose URL contains the specified keyword.
	if debugKeyword != "" && strings.Contains(resp.Request.RawURL, debugKeyword) {
		fmt.Println(resp.Request.Method, resp.Request.RawURL)
		fmt.Println(resp.Dump())
	}
	return nil
})

func main() {
	go func() {
		gin.SetMode(gin.ReleaseMode)
		r := gin.New()
		r.GET("/debug", func(c *gin.Context) {
			debugKeyword = c.Query("keyword") // Enable conditional debug via API: /debug?url=keyword
			if debugKeyword == "off" {
				debugKeyword = ""
				fmt.Println("Debug is disabled")
			} else if debugKeyword != "" {
				fmt.Println("Start to debug", debugKeyword)
			}
		})
		r.Run("0.0.0.0:80")
	}()

	urls := []string{
		"https://httpbin.org/get",
		"https://httpbin.org/uuid",
		"https://httpbin.org/json",
		"https://httpbin.org/html",
		"https://httpbin.org/robots.txt",
		"https://httpbin.org/xml",
		"https://httpbin.org/headers",
		"https://httpbin.org/ip",
		"https://httpbin.org/user-agent",
		"https://api.github.com/users/imroc",
	}
	for {
		time.Sleep(5 * time.Second)
		for _, url := range urls {
			_, err := globalClient.R().
				Get(url)
			if err != nil {
				fmt.Println("ERROR:", err.Error())
				continue
			}
		}
		fmt.Println("all requests completed")
	}
}
```

编译并运行:

```bash
$ go build -o test
$ ./test
./test
all requests completed
all requests completed
all requests completed
all requests completed
```

然后动态打开 Debug，并只 Debug `/robots.txt` 接口:

```bash
curl 'http://127.0.0.1:80/debug?keyword=/robots.txt'
```

再看看之前程序的输出变化:

```txt
Start to debug /robots.txt
GET https://httpbin.org/robots.txt
:authority: httpbin.org
:method: GET
:path: /robots.txt
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 200
date: Fri, 27 May 2022 13:25:18 GMT
content-type: text/plain
content-length: 30
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

User-agent: *
Disallow: /deny


all requests completed
```

再试试只 Debug GitHub 的 `/users` 接口:

```bash
curl 'http://127.0.0.1:80/debug?keyword=https://api.github.com/users'
```

看看输出的变化:

```txt
Start to debug https://api.github.com/users
GET https://api.github.com/users/imroc
:authority: api.github.com
:method: GET
:path: /users/imroc
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 200
server: GitHub.com
date: Fri, 27 May 2022 13:32:58 GMT
content-type: application/json; charset=utf-8
cache-control: public, max-age=60, s-maxage=60
vary: Accept, Accept-Encoding, Accept, X-Requested-With
etag: W/"27cfedd070da5ec89d2bcf17b2cb05ac7d8a2dba510f9f8be1578ed6f845a468"
last-modified: Tue, 03 May 2022 12:12:52 GMT
x-github-media-type: github.v3; format=json
access-control-expose-headers: ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Used, X-RateLimit-Resource, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type, X-GitHub-SSO, X-GitHub-Request-Id, Deprecation, Sunset
access-control-allow-origin: *
strict-transport-security: max-age=31536000; includeSubdomains; preload
x-frame-options: deny
x-content-type-options: nosniff
x-xss-protection: 0
referrer-policy: origin-when-cross-origin, strict-origin-when-cross-origin
content-security-policy: default-src 'none'
content-encoding: gzip
x-ratelimit-limit: 60
x-ratelimit-remaining: 25
x-ratelimit-reset: 1653660880
x-ratelimit-resource: core
x-ratelimit-used: 35
accept-ranges: bytes
content-length: 486
x-github-request-id: DA88:054C:446B5:51534:6290D30A

{"login":"imroc","id":7448852,"node_id":"MDQ6VXNlcjc0NDg4NTI=","avatar_url":"https://avatars.githubusercontent.com/u/7448852?v=4","gravatar_id":"","url":"https://api.github.com/users/imroc","html_url":"https://github.com/imroc","followers_url":"https://api.github.com/users/imroc/followers","following_url":"https://api.github.com/users/imroc/following{/other_user}","gists_url":"https://api.github.com/users/imroc/gists{/gist_id}","starred_url":"https://api.github.com/users/imroc/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/imroc/subscriptions","organizations_url":"https://api.github.com/users/imroc/orgs","repos_url":"https://api.github.com/users/imroc/repos","events_url":"https://api.github.com/users/imroc/events{/privacy}","received_events_url":"https://api.github.com/users/imroc/received_events","type":"User","site_admin":false,"name":"roc","company":"Tencent","blog":"https://imroc.cc","location":"China","email":null,"hireable":true,"bio":"I'm roc","twitter_username":"imrocchan","public_repos":136,"public_gists":0,"followers":406,"following":155,"created_at":"2014-04-30T10:50:46Z","updated_at":"2022-05-03T12:12:52Z"}

all requests completed
```

---
title: "使用中间件统一处理异常"
description: "介绍如何使用中间件为所有请求统一处理异常"
lead: ""
draft: false
images: []
weight: 1004
menu:
  docs:
    parent: "examples"
toc: true
---

## 概述

我们可以利用 `req` 的中间件能力来统一处理所有请求的异常，减少重复代码:
* 同一个服务端的所有 API 的错误响应消息格式通常都是一致的，我们可以定义一个代表错误响应的 struct 并实现 error 接口，将 API 错误响应统一转换为 error 返回。
* 遇到非预期的响应，既不是成功的响应，也不是错误的响应，我们可以将 HTTP 内容 dump 下来记录并统一转换为 error 返回，方便后续定位问题。

## 代码示例

我们来封装一个 Client :

```go
// APIError is the struct of the error message returned by the server,
// which implements the go error interface, converts api error response
// into human-readable error message.
type APIError struct {
    Message          string `json:"message"`
    DocumentationUrl string `json:"documentation_url"`
}

func (e *APIError) Error() string {
    return fmt.Sprintf("API Error: %s (refer to %s)", e.Message, e.DocumentationUrl)
}

type Client struct {
    *req.Client
}

func NewClient() *Client {
    c := req.C().
    SetBaseURL("https://api.github.com").
    // Enable dump at the request-level for each request, and only
    // temporarily stores the dump content in memory, so we can call
    // resp.Dump() to get the dump content when needed in response
    // middleware.
	  // This is actually a syntax sugar, implemented internally using
	  // request middleware
    EnableDumpEachRequest().
    // Set the common error struct which will be unmarshalled into if server returns
    // an error response.
    SetCommonError(&APIError{}).
    // Handle common exceptions in response middleware.
    OnAfterResponse(func(client *req.Client, resp *req.Response) error {
        if resp.Err != nil { // resp.Err represents the underlying error, e.g. network error, or unmarshal error (SetResult or SetError was invoked before).
            if dump := resp.Dump(); dump != "" { // Append dump content to original underlying error to help troubleshoot if request has been sent.
                resp.Err = fmt.Errorf("%s\nraw content:\n%s", resp.Err.Error(), resp.Dump())
            }
            return nil // Skip the following logic if there is an underlying error.
        }
        // Return a human-readable error if server api returned an error message.
        if err, ok := resp.Error().(*APIError); ok {
            resp.Err = err
            return nil
        }
        // Corner case: neither an error response nor a success response (e.g. status code < 200),
        // dump content to help troubleshoot.
        if !resp.IsSuccess() {
            resp.Err = fmt.Errorf("bad response, raw content:\n%s", resp.Dump())
            return nil
        }
        return nil
    })

    if os.Getenv("DEBUG") == "on" {
        c.DevMode()
    }
    return &Client{c}
}
```

* `APIError` 结构体代表服务端 API 错误响应的格式，实现 go 的 error 接口，将 json 格式的 API 错误信息转换成可读的字符串错误提示。
* `SetCommonError` 传入 `APIError` 结构体，表示如果是错误响应(状态码大于 400)，自动将响应体 Unmarshal 到结构体。
* `OnBeforeRequest` 中添加 `RequestMiddleware`，为所有请求开启请求级别的 dump (存到内存，不打印出来，需要的时候取出来)。
* `OnAfterResponse` 中添加 `ResponseMiddleware`，统一处理异常。如果发生了底层错误(如网络错误，或者响应体格式错误导致Unmarshal失败)，忽略后续逻辑；如果是错误响应，将自动Unmarshal的结构体当成 go error 抛给调用方；如果既不是错误响应，又不是成功响应(状态码小于200)，说明服务端有问题，将dump内容写到error抛给调用方。

接下来对接一个获取用户信息的 API:

```go
type UserProfile struct {
	Name string `json:"name"`
	Blog string `json:"blog"`
}

func (c *Client) GetUserProfile(username string) (user *UserProfile, err error) {
	err = c.Get("/users/{username}").
		SetPathParam("username", username).
		SetResult(&user).
		Do().Err
	return
}

```

* 对接 API 的函数简单到极致，甚至都不需要初始化代表响应数据的 `UserProfile` 结构体，直接传入返回参数列表中的 user 空指针的地址，内部会自动根据指针指向结构体类型自动创建相应的对象并修改指针指向。
* 无需处理异常，因为统一在中间件中处理了。

写个 main 函数来测试下:

```go
func main() {
    if len(os.Args) < 2 {
        fmt.Fprintln(os.Stderr, "please give an username!")
        os.Exit(1)
    }
    username := os.Args[1]
    c := NewClient()

    user, err := c.GetUserProfile(username)

    if err != nil {
        fmt.Fprintln(os.Stderr, err.Error())
        os.Exit(2)
    }

    fmt.Printf("%s (%s)\n", user.Name, user.Blog)
}

```

编译并运行，看看正常情况:

```bash
$ go build -o test
$ ./test imroc
roc (https://imroc.cc)

# Enable debug to see details
$ DEBUG=on ./test imroc
2022/08/12 19:17:07.504655 DEBUG [req] HTTP/2 GET https://api.github.com/users/imroc
:authority: api.github.com
:method: GET
:path: /users/imroc
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 200
server: GitHub.com
date: Fri, 12 Aug 2022 11:17:07 GMT
content-type: application/json; charset=utf-8
cache-control: public, max-age=60, s-maxage=60
vary: Accept, Accept-Encoding, Accept, X-Requested-With
etag: W/"a16aa407243279952281ead7b8b611f46a498001ed7dc0d3431ddf70c06d37ac"
last-modified: Sat, 30 Jul 2022 01:10:20 GMT
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
x-ratelimit-remaining: 55
x-ratelimit-reset: 1660306314
x-ratelimit-resource: core
x-ratelimit-used: 5
accept-ranges: bytes
content-length: 482
x-github-request-id: 1347:59D0:229C8FC:23E36A1:62F636B3

{"login":"imroc","id":7448852,"node_id":"MDQ6VXNlcjc0NDg4NTI=","avatar_url":"https://avatars.githubusercontent.com/u/7448852?v=4","gravatar_id":"","url":"https://api.github.com/users/imroc","html_url":"https://github.com/imroc","followers_url":"https://api.github.com/users/imroc/followers","following_url":"https://api.github.com/users/imroc/following{/other_user}","gists_url":"https://api.github.com/users/imroc/gists{/gist_id}","starred_url":"https://api.github.com/users/imroc/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/imroc/subscriptions","organizations_url":"https://api.github.com/users/imroc/orgs","repos_url":"https://api.github.com/users/imroc/repos","events_url":"https://api.github.com/users/imroc/events{/privacy}","received_events_url":"https://api.github.com/users/imroc/received_events","type":"User","site_admin":false,"name":"roc","company":"Tencent","blog":"https://imroc.cc","location":"China","email":null,"hireable":true,"bio":"I'm roc","twitter_username":"imrocchan","public_repos":141,"public_gists":0,"followers":440,"following":157,"created_at":"2014-04-30T10:50:46Z","updated_at":"2022-07-30T01:10:20Z"}
roc (https://imroc.cc)
```

再来看看异常情况:

```bash
$ ./test 29d99b575ba3
API Error: Not Found (refer to https://docs.github.com/rest/reference/users#get-a-user)

# Enable debug to see details
$ DEBUG=on ./test 29d99b575ba3
2022/08/12 19:18:01.109599 DEBUG [req] HTTP/2 GET https://api.github.com/users/29d99b575ba3
:authority: api.github.com
:method: GET
:path: /users/29d99b575ba3
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 404
server: GitHub.com
date: Fri, 12 Aug 2022 11:18:01 GMT
content-type: application/json; charset=utf-8
x-github-media-type: github.v3; format=json
access-control-expose-headers: ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Used, X-RateLimit-Resource, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type, X-GitHub-SSO, X-GitHub-Request-Id, Deprecation, Sunset
access-control-allow-origin: *
strict-transport-security: max-age=31536000; includeSubdomains; preload
x-frame-options: deny
x-content-type-options: nosniff
x-xss-protection: 0
referrer-policy: origin-when-cross-origin, strict-origin-when-cross-origin
content-security-policy: default-src 'none'
vary: Accept-Encoding, Accept, X-Requested-With
content-encoding: gzip
x-ratelimit-limit: 60
x-ratelimit-remaining: 53
x-ratelimit-reset: 1660306314
x-ratelimit-resource: core
x-ratelimit-used: 7
content-length: 108
x-github-request-id: 14F6:0A72:214D8D2:2293823:62F636E9

{"message":"Not Found","documentation_url":"https://docs.github.com/rest/reference/users#get-a-user"}
API Error: Not Found (refer to https://docs.github.com/rest/reference/users#get-a-user)
```

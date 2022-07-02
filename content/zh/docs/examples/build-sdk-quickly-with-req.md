---
title: "使用 req 快速封装 SDK"
description: "介绍如何使用 req 快速开发出 SDK"
lead: ""
draft: false
images: []
weight: 1007
menu:
  docs:
    parent: "examples"
toc: true
---

## 概述

利用 `req` 强大而又灵活的特性，我们可以针对服务端提供的 API 快速封装出好用的 golang SDK。

大致思路是：
1. 将 `req` 的 `Client` 嵌入到 SDK 核心的 struct 中，为所有 API 请求设置共同的属性(请求头，认证信息，URL 地址前缀等)。
2. 处理 response 时，将一些通用处理逻辑提取出来，注册到 response 中间件里进行处理(处理 server 返回非预期的状态码，处理 API 返回错误)。
3. 在 SDK 中集成 `req` 强大的 API Debug 能力，在使用该 SDK 的程序中可以动态决定是否打开 Debug。
4. 封装 API 的实现方法里，通常只需要根据 API 设置好需要的参数与要响应的对象然后直接返回即可，一般只需要几行代码。

本文以 GitHub API 为例，封装一个简单又强大的 SDK。

## 开发 Github SDK 的代码示例

为 GitHub 定义一个 Client，使用 `req` 进行封装，`client.go`:

```go
import (
	"fmt"
	"github.com/imroc/req/v3"
	"strings"
)

// GithubClient is the go client for GitHub API.
type GithubClient struct {
	*req.Client
	isLogged bool
}

// NewGithubClient create a GitHub client.
func NewGithubClient() *GithubClient {
	c := req.C().
		// All GitHub API requests need this header.
		SetCommonHeader("Accept", "application/vnd.github.v3+json").
		// All GitHub API requests use the same base URL.
		SetBaseURL("https://api.github.com").
		// EnableDump at the request level in request middleware which dump content into
		// memory (not print to stdout), we can record dump content only when unexpected
		// exception occurs, it is helpful to troubleshoot problems in production.
		OnBeforeRequest(func(c *req.Client, r *req.Request) error {
			if r.RetryAttempt > 0 { // Ignore on retry.
				return nil
			}
			r.EnableDump()
			return nil
		}).
		// Unmarshal all GitHub error response into struct.
		SetCommonError(&APIError{}).
		// Handle common exceptions in response middleware.
		OnAfterResponse(func(client *req.Client, resp *req.Response) error {
			if err, ok := resp.Error().(*APIError); ok {
				// Server returns an error message, convert it to human-readable go error.
				return err
			}
			// Corner case: neither an error response nor a success response,
			// dump content to help troubleshoot.
			if !resp.IsSuccess() {
				return fmt.Errorf("bad response, raw dump:\n%s", resp.Dump())
			}
			return nil
		})

	return &GithubClient{
		Client: c,
	}
}

// APIError represents the error message that GitHub API returns.
// GitHub API doc: https://docs.github.com/en/rest/overview/resources-in-the-rest-api#client-errors
type APIError struct {
	Message          string `json:"message"`
	DocumentationUrl string `json:"documentation_url,omitempty"`
	Errors           []struct {
		Resource string `json:"resource"`
		Field    string `json:"field"`
		Code     string `json:"code"`
	} `json:"errors,omitempty"`
}

// Error convert APIError to a human readable error and return.
func (e *APIError) Error() string {
	msg := fmt.Sprintf("API error: %s", e.Message)
	if e.DocumentationUrl != "" {
		return fmt.Sprintf("%s (see doc %s)", msg, e.DocumentationUrl)
	}
	if len(e.Errors) == 0 {
		return msg
	}
	errs := []string{}
	for _, err := range e.Errors {
		errs = append(errs, fmt.Sprintf("resource:%s field:%s code:%s", err.Resource, err.Field, err.Code))
	}
	return fmt.Sprintf("%s (%s)", msg, strings.Join(errs, " | "))
}

// LoginWithToken login with GitHub personal access token.
// GitHub API doc: https://docs.github.com/en/rest/overview/other-authentication-methods#authenticating-for-saml-sso
func (c *GithubClient) LoginWithToken(token string) *GithubClient {
	c.SetCommonHeader("Authorization", "token "+token)
	c.isLogged = true
	return c
}

// IsLogged return true is user is logged in, otherwise false.
func (c *GithubClient) IsLogged() bool {
	return c.isLogged
}

// SetDebug enable debug if set to true, disable debug if set to false.
func (c *GithubClient) SetDebug(enable bool) *GithubClient {
	if enable {
		c.EnableDebugLog()
		c.EnableDumpAll()
	} else {
		c.DisableDebugLog()
		c.DisableDumpAll()
	}
	return c
}
```

对用户信息相关接口进行封装，`user_profile.go`:

```go
import "time"

// GetMyProfile return the user profile of current authenticated user.
// Github API doc: https://docs.github.com/en/rest/users/users#get-the-authenticated-user
func (c *GithubClient) GetMyProfile() (*UserProfile, error) {
	user := &UserProfile{}
	_, err := c.R().SetResult(user).Get("/user")
	return user, err
}

// GetUserProfile return the user profile of specified username.
// Github API doc: https://docs.github.com/en/rest/users/users#get-a-user
func (c *GithubClient) GetUserProfile(username string) (*UserProfile, error) {
	user := &UserProfile{}
	_, err := c.R().SetResult(user).
		SetPathParam("username", username).
		Get("/users/{username}")
	return user, err
}

type UserProfile struct {
	Login             string    `json:"login"`
	Id                int       `json:"id"`
	NodeId            string    `json:"node_id"`
	AvatarUrl         string    `json:"avatar_url"`
	GravatarId        string    `json:"gravatar_id"`
	Url               string    `json:"url"`
	HtmlUrl           string    `json:"html_url"`
	FollowersUrl      string    `json:"followers_url"`
	FollowingUrl      string    `json:"following_url"`
	GistsUrl          string    `json:"gists_url"`
	StarredUrl        string    `json:"starred_url"`
	SubscriptionsUrl  string    `json:"subscriptions_url"`
	OrganizationsUrl  string    `json:"organizations_url"`
	ReposUrl          string    `json:"repos_url"`
	EventsUrl         string    `json:"events_url"`
	ReceivedEventsUrl string    `json:"received_events_url"`
	Type              string    `json:"type"`
	SiteAdmin         bool      `json:"site_admin"`
	Name              string    `json:"name"`
	Company           string    `json:"company"`
	Blog              string    `json:"blog"`
	Location          string    `json:"location"`
	Email             string    `json:"email"`
	Hireable          bool      `json:"hireable"`
	Bio               string    `json:"bio"`
	TwitterUsername   string    `json:"twitter_username"`
	PublicRepos       int       `json:"public_repos"`
	PublicGists       int       `json:"public_gists"`
	Followers         int       `json:"followers"`
	Following         int       `json:"following"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}
```

好了，一个简单又强大的 GitHub SDK 封装完成，这里只封装了两个接口，但每个接口的实现函数都只需几行代码，可以以此类推快速的封装其它接口。

接下来我们使用该 SDK 写一个简单的可执行程序:
1. 当给程序传入了一个 GitHub 的 username，表示查询该用户的信息。
2. 当设置 `TOKEN` 环境变量表示登录 GitHub，查询当前登录用户的信息。
3. 当设置 `DEBUG` 环境变量为 `on` 表示开启 Debug，打印请求详情。

`main.go`:

```go
import (
	"fmt"
	"os"
)

var github = NewGithubClient()

func init() {
	if os.Getenv("DEBUG") == "on" {
    github.SetDebug(true)
	}
	if token := os.Getenv("TOKEN"); token != "" {
    github.LoginWithToken(token)
		return
	}
}

func main() {
	if len(os.Args) > 1 {
		username := os.Args[1]
		user, err := github.GetUserProfile(username)
		if err != nil {
			fmt.Println(err)
			return
		}
		fmt.Println("--------------------")
		fmt.Printf("%s's website: %s\n", user.Name, user.Blog)
		return
	}
	if github.IsLogged() {
		user, err := github.GetMyProfile()
		if err != nil {
			fmt.Println(err)
			return
		}
		fmt.Println("--------------------")
		fmt.Printf("%s's website: %s\n", user.Name, user.Blog)
		return
	}
	fmt.Println("please give an username or set TOKEN env")
}
```

编译并运行:

```bash
$ go build -o test
$ ./test spf13
--------------------
Steve Francia's website: http://spf13.com
```

提供错误的 TOKEN 运行:

```bash
$ export TOKEN=test
$ ./test
API error: Bad credentials (see doc https://docs.github.com/rest)
```

提供正确的 TOKEN 运行:

```bash
$ export TOKEN=ghp_Bi6T*****************************ai3
$ ./test
--------------------
roc's website: https://imroc.cc
```

提供不存在的 username 运行:

```bash
$ ./test 683d977eb7854a43
API error: Not Found (see doc https://docs.github.com/rest/reference/users#get-a-user)
```

打开 Debug 运行:

```bash
$ export DEBUG=on
$ ./test
2022/05/26 21:26:46.485766 DEBUG [req] HTTP/2 GET https://api.github.com/user
:authority: api.github.com
:method: GET
:path: /user
:scheme: https
accept: application/vnd.github.v3+json
authorization: token ghp_Bi6T*****************************ai3
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 200
server: GitHub.com
date: Thu, 26 May 2022 13:26:46 GMT
content-type: application/json; charset=utf-8
cache-control: private, max-age=60, s-maxage=60
vary: Accept, Authorization, Cookie, X-GitHub-OTP
etag: W/"8b43712c00d18ff0f692b0330329e5c4b4690b3ecd088a5603f1e699cadfc039"
last-modified: Tue, 03 May 2022 12:12:52 GMT
x-oauth-scopes: admin:enterprise, admin:gpg_key, admin:org, admin:org_hook, admin:public_key, admin:repo_hook, delete:packages, delete_repo, gist, notifications, repo, user, workflow, write:discussion, write:packages
x-accepted-oauth-scopes:
github-authentication-token-expiration: 2022-06-25 09:33:01 UTC
x-github-media-type: github.v3; format=json
x-ratelimit-limit: 5000
x-ratelimit-remaining: 4992
x-ratelimit-reset: 1653572352
x-ratelimit-used: 8
x-ratelimit-resource: core
access-control-expose-headers: ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Used, X-RateLimit-Resource, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type, X-GitHub-SSO, X-GitHub-Request-Id, Deprecation, Sunset
access-control-allow-origin: *
strict-transportWrapper-security: max-age=31536000; includeSubdomains; preload
x-frame-options: deny
x-content-type-options: nosniff
x-xss-protection: 0
referrer-policy: origin-when-cross-origin, strict-origin-when-cross-origin
content-security-policy: default-src 'none'
vary: Accept-Encoding, Accept, X-Requested-With
content-encoding: gzip
x-github-request-id: 42FE:77A0:7826:8159:628F8016

{"login":"imroc","id":7448852,"node_id":"MDQ6VXNlcjc0NDg4NTI=","avatar_url":"https://avatars.githubusercontent.com/u/7448852?v=4","gravatar_id":"","url":"https://api.github.com/users/imroc","html_url":"https://github.com/imroc","followers_url":"https://api.github.com/users/imroc/followers","following_url":"https://api.github.com/users/imroc/following{/other_user}","gists_url":"https://api.github.com/users/imroc/gists{/gist_id}","starred_url":"https://api.github.com/users/imroc/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/imroc/subscriptions","organizations_url":"https://api.github.com/users/imroc/orgs","repos_url":"https://api.github.com/users/imroc/repos","events_url":"https://api.github.com/users/imroc/events{/privacy}","received_events_url":"https://api.github.com/users/imroc/received_events","type":"User","site_admin":false,"name":"roc","company":"Tencent","blog":"https://imroc.cc","location":"China","email":"roc@imroc.cc","hireable":true,"bio":"I'm roc","twitter_username":"imrocchan","public_repos":136,"public_gists":0,"followers":406,"following":155,"created_at":"2014-04-30T10:50:46Z","updated_at":"2022-05-03T12:12:52Z","private_gists":1,"total_private_repos":2,"owned_private_repos":2,"disk_usage":521309,"collaborators":0,"two_factor_authentication":true,"plan":{"name":"free","space":976562499,"collaborators":0,"private_repos":10000}}
--------------------
roc's website: https://imroc.cc
```

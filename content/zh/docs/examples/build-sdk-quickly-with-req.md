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

## 开发 Github SDK 的代码示例

为 GitHub 定义一个 Client，使用 `req` 进行封装，`client.go`:

```go
import (
	"errors"
	"fmt"
	"github.com/imroc/req/v3"
	"strings"
)

// Client is the go client for GitHub API.
type Client struct {
	*req.Client
	isLogged bool
}

// NewClient create a GitHub client.
func NewClient() *Client {
	c := req.C().
		// All GitHub API requests need this header.
		SetCommonHeader("Accept", "application/vnd.github.v3+json").
		// All GitHub API requests use the same base URL.
		SetBaseURL("https://api.github.com").
		// Register a middleware to handle response for every request with common logic.
		OnAfterResponse(func(client *req.Client, resp *req.Response) error {
			if resp.StatusCode < 200 { // This should not happen.
				return fmt.Errorf("bad status code: %d", resp.StatusCode)
			}
			if resp.IsError() { // API returns error message, convert it to go error.
				var errMsg ErrorMessage
				err := resp.UnmarshalJson(&errMsg)
				if err != nil {
					return err
				}
				return errMsg.Error()
			}
			return nil
		})

	return &Client{
		Client: c,
	}
}

// ErrorMessage represents the error message that GitHub API returns.
// GitHub API doc: https://docs.github.com/en/rest/overview/resources-in-the-rest-api#client-errors
type ErrorMessage struct {
	Message          string `json:"message"`
	DocumentationUrl string `json:"documentation_url,omitempty"`
	Errors           []struct {
		Resource string `json:"resource"`
		Field    string `json:"field"`
		Code     string `json:"code"`
	} `json:"errors,omitempty"`
}

// Error convert ErrorMessage to a human readable error and return.
func (em *ErrorMessage) Error() error {
	msg := fmt.Sprintf("API error: %s", em.Message)
	if em.DocumentationUrl != "" {
		return fmt.Errorf("%s (see doc %s)", msg, em.DocumentationUrl)
	}
	if len(em.Errors) == 0 {
		return errors.New(msg)
	}
	errs := []string{}
	for _, err := range em.Errors {
		errs = append(errs, fmt.Sprintf("resource:%s field:%s code:%s", err.Resource, err.Field, err.Code))
	}
	return fmt.Errorf("%s (%s)", msg, strings.Join(errs, " | "))
}

// LoginWithToken login with GitHub personal access token.
// GitHub API doc: https://docs.github.com/en/rest/overview/other-authentication-methods#authenticating-for-saml-sso
func (c *Client) LoginWithToken(token string) *Client {
	c.SetCommonHeader("Authorization", "token "+token)
	c.isLogged = true
	return c
}

// IsLogged return true is user is logged in, otherwise false.
func (c *Client) IsLogged() bool {
	return c.isLogged
}
```

对用户信息相关接口进行封装，`user_profile.go`:

```go
import "time"

// GetMyProfile return the user profile of current authenticated user.
// Github API doc: https://docs.github.com/en/rest/users/users#get-the-authenticated-user
func (c *Client) GetMyProfile() (*UserProfile, error) {
	user := &UserProfile{}
	_, err := c.R().
		SetResult(user).
		Get("/user")
	return user, err
}

// GetUserProfile return the user profile of specified username.
// Github API doc: https://docs.github.com/en/rest/users/users#get-a-user
func (c *Client) GetUserProfile(username string) (*UserProfile, error) {
	user := &UserProfile{}
	_, err := c.R().
		SetResult(user).
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

好了，一个简单又强大的 GitHub SDK 封装完成，接下来我们使用该 SDK 写一个简单的可执行程序:
1. 当给程序传入了一个 GitHub 的 username，表示查询该用户的信息。
2. 当设置 `TOKEN` 环境变量表示登录 GitHub，查询当前登录用户的信息。
3. 当设置 `DEBUG` 环境变量为 `on` 表示开启 Debug，打印请求详情。

`main.go`:

```go
import (
	"fmt"
	"os"
)

var client = NewClient()

func init() {
	if os.Getenv("DEBUG") == "on" {
		client.EnableDumpAll()
		client.EnableDebugLog()
	}
	if token := os.Getenv("TOKEN"); token != "" {
		client.LoginWithToken(token)
		return
	}
}

func main() {
	if len(os.Args) > 1 {
		username := os.Args[1]
		user, err := client.GetUserProfile(username)
		if err != nil {
			fmt.Println(err)
			return
		}
		fmt.Println("--------------------")
		fmt.Printf("%s's website: %s\n", user.Name, user.Blog)
		return
	}
	if client.IsLogged() {
		user, err := client.GetMyProfile()
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
strict-transport-security: max-age=31536000; includeSubdomains; preload
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

---
title: "Handle Exceptions with Middleware"
description: "This article will introduce how to handle exceptions with middleware"
lead: ""
draft: false
images: []
weight: 1004
menu:
  docs:
    parent: "examples"
toc: true
---

## Overview

We can handle exceptions for all requests using req's middleware to reduce duplicate code:
* The error response message format of all APIs on the same server is usually the same. We can define a struct representing the error response and implement the error interface to uniformly convert the API error response into a go error and return.
* When an unexpected response is returned, which is neither a successful response nor an error response. We can dump the HTTP content, and convert it into an error to return, which is helpful to troubleshoot problems.

## Code Example

Let's encapsulate a Client:

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

* The `APIError` struct represents the format of the server-side API error response, implements the go error interface, and converts the API error message in json format into a human-readable error string.
* Pass the `APIError` struct into `SetCommonError`, indicating that if it is an error response (status code >= 400), the response body will be automatically unmarshal to the struct.
* Add `RequestMiddleware` to `OnBeforeRequest` to enable request-level dump for all requests (stored in memory, not printed out, get dump content when needed).
* Add `ResponseMiddleware` to `OnAfterResponse` to handle exceptions uniformly. If a underlying error occurs (such as a network error, or the response body format error causes unmarshal to fail), the subsequent logic is ignored; If it is an error response, the `APIError` struct will be thrown to the caller as a go error; If it is neither an error response nor a successful response (usually the status code is less than 200), it means that the behavior of the server is abnormal, and the dump content is written to the error and thrown to the caller.

Next, add `GetUserProfile` to Client:

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

* The implementation of an API client is extremely simple, and it does not even need to initialize the `UserProfile` struct which represents the response body, just pass in the address of the user nil pointer in the return list, and the corresponding struct will be automatically created internally according to the type of the struct pointed to by the pointer.
* No need to handle exceptions, because it is already handled in the middleware.

Write a main function to test it:

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

Compile and run:

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

Test for exceptions:

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

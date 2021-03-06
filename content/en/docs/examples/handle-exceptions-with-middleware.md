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

Let's encapsulate a client, `client.go`:

```go
package main

import (
	"fmt"
	"github.com/imroc/req/v3"
	"os"
)

// APIError is the struct of the error message returned by the server,
// which implements the go error interface.
type APIError struct {
	Message          string `json:"message"`
	DocumentationUrl string `json:"documentation_url"`
}

func (e *APIError) Error() string {
	return fmt.Sprintf("API Error: %s (refer to %s)", e.Message, e.DocumentationUrl)
}

func NewClient() *req.Client {
	c := req.C().
		// EnableDump at the request level in request middleware which dump content into
		// memory (not print to stdout), we can record dump content only when unexpected
		// exception occurs, it is helpful to troubleshoot problems in production.
		OnBeforeRequest(func(client *req.Client, r *req.Request) error {
			if r.RetryAttempt > 0 {
				return nil
			}
			r.EnableDump()
			return nil
		}).
		// Set the common error struct which will be unmarshalled into if server returns
		// an error response.
		SetCommonError(&APIError{}).
		// Handle common exceptions in response middleware.
		OnAfterResponse(func(client *req.Client, resp *req.Response) error {
			// Return a human-readable error if server api returned an error message.
			if err, ok := resp.Error().(*APIError); ok {
				return err
			}
			// Corner case: neither an error response nor a success response,
			// dump content to help troubleshoot.
			if !resp.IsSuccess() {
				return fmt.Errorf("bad response, raw dump:\n%s", resp.Dump())
			}
			return nil
		})

	if os.Getenv("DEBUG") == "on" {
		c.DevMode()
	}
	return c
}
```

Write a program that uses the client, `main.go`:

```go
package main

import (
	"fmt"
	"os"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "please give an username!")
		os.Exit(1)
	}
	username := os.Args[1]
	c := NewClient()

	var user struct {
		Name string `json:"name"`
	}
	_, err := c.R().
		SetResult(&user).
		SetPathParam("username", username).
		Get("https://api.github.com/users/{username}")

	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(2)
	}

	fmt.Printf("%s's nick name is %s\n", username, user.Name)
}
```

Build and run, pass the correct username:

```bash
$ go build -o test
$ ./test imroc
imroc's nick name is roc

# Enable debug to see details
$ DEBUG=on ./test imroc
2022/06/02 16:41:35.509223 DEBUG [req] HTTP/2 GET https://api.github.com/users/imroc
:authority: api.github.com
:method: GET
:path: /users/imroc
:scheme: https
user-agent: req/v3 (https://github.com/imroc/req/v3)
accept-encoding: gzip

:status: 200
server: GitHub.com
date: Thu, 02 Jun 2022 08:41:23 GMT
content-type: application/json; charset=utf-8
cache-control: public, max-age=60, s-maxage=60
vary: Accept, Accept-Encoding, Accept, X-Requested-With
etag: W/"618f162c67152e1633dd877b2342f8274818cc0ac01d3d8f183118fecc9de251"
last-modified: Tue, 03 May 2022 12:12:52 GMT
x-github-media-type: github.v3; format=json
access-control-expose-headers: ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Used, X-RateLimit-Resource, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type, X-GitHub-SSO, X-GitHub-Request-Id, Deprecation, Sunset
access-control-allow-origin: *
strict-transportWrapper-security: max-age=31536000; includeSubdomains; preload
x-frame-options: deny
x-content-type-options: nosniff
x-xss-protection: 0
referrer-policy: origin-when-cross-origin, strict-origin-when-cross-origin
content-security-policy: default-src 'none'
content-encoding: gzip
x-ratelimit-limit: 60
x-ratelimit-remaining: 53
x-ratelimit-reset: 1654160632
x-ratelimit-resource: core
x-ratelimit-used: 7
accept-ranges: bytes
content-length: 486
x-github-request-id: B950:29B8:8B99FD:9B0FF0:629877BF

{"login":"imroc","id":7448852,"node_id":"MDQ6VXNlcjc0NDg4NTI=","avatar_url":"https://avatars.githubusercontent.com/u/7448852?v=4","gravatar_id":"","url":"https://api.github.com/users/imroc","html_url":"https://github.com/imroc","followers_url":"https://api.github.com/users/imroc/followers","following_url":"https://api.github.com/users/imroc/following{/other_user}","gists_url":"https://api.github.com/users/imroc/gists{/gist_id}","starred_url":"https://api.github.com/users/imroc/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/imroc/subscriptions","organizations_url":"https://api.github.com/users/imroc/orgs","repos_url":"https://api.github.com/users/imroc/repos","events_url":"https://api.github.com/users/imroc/events{/privacy}","received_events_url":"https://api.github.com/users/imroc/received_events","type":"User","site_admin":false,"name":"roc","company":"Tencent","blog":"https://imroc.cc","location":"China","email":null,"hireable":true,"bio":"I'm roc","twitter_username":"imrocchan","public_repos":137,"public_gists":0,"followers":407,"following":155,"created_at":"2014-04-30T10:50:46Z","updated_at":"2022-05-03T12:12:52Z"}
imroc's nick name is roc
```

Now, let's see what's going on when the wrong username is passed in:

```bash
$ ./test 29d99b575ba3
API Error: Not Found (refer to https://docs.github.com/rest/reference/users#get-a-user)

# Enable debug to see details
$ DEBUG=on ./test 29d99b575ba3
2022/06/02 17:20:49.681282 DEBUG [req] HTTP/2 GET https://api.github.com/users/29d99b575ba3
:authority: api.github.com
:method: GET
:path: /users/29d99b575ba3
:scheme: https
user-agent: req/v3 (https://github.com/imroc/req/v3)
accept-encoding: gzip

:status: 404
server: GitHub.com
date: Thu, 02 Jun 2022 09:20:49 GMT
content-type: application/json; charset=utf-8
x-github-media-type: github.v3; format=json
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
x-ratelimit-limit: 60
x-ratelimit-remaining: 57
x-ratelimit-reset: 1654165032
x-ratelimit-resource: core
x-ratelimit-used: 3
content-length: 117
x-github-request-id: E934:2D2C:F6100E:10651ED:629880F1

{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/rest/reference/users#get-a-user"
}

API Error: Not Found (refer to https://docs.github.com/rest/reference/users#get-a-user
```

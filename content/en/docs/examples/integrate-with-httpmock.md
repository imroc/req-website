---
title: "Integrate with httpmock"
description: "This article will introduce how to integrate req with httpmock"
lead: ""
draft: false
images: []
weight: 1009
menu:
  docs:
    parent: "examples"
toc: true
---

## Overview

[httpmock](https://github.com/jarcoal/httpmock) is often used for HTTP-related unit tests: when you write a function that involves remote HTTP API calls, and want to make it covered by unit tests, but if you make remote HTTP calls in unit tests, it will fail if the network is unreachable or the remote server API is unavailable. Therefore, we generally use httpmock to intercept our requests and directly return the data we expect to return, this makes it possible to complete HTTP-related unit tests directly without going through the network transportWrapper.

This article will show you how to write unit tests using httpmock if your project uses `req` as the http client.

## Principle Introduction

httpmock mainly implements request interception by replacing the `Transport` of `http.Client`, so that the originating `Request` does not go through the network but directly returns the corresponding `Response` according to the configuration of httpmock. `client.GetClient()` can get the internal `http.Client`, which we pass to httpmock to replace the default `Transport` of `req` to integrate with httpmock.

> The dump capability and part of the debug log capability of req come from its own implementation of Transport, which will be lost after httpmock replaces Transport.

## Simple Example

Suppose we have written a function to get the user name of the specified GitHub account:

```go
import (
	"fmt"
	"github.com/imroc/req/v3"
)

func GetUserName(client *req.Client, loginName string) (name string, err error) {
	var user struct {
		Name string `json:"name"`
	}
	resp, err := client.R().
		SetResult(&user).
		SetPathParam("loginName", loginName).
		Get("https://api.github.com/users/{loginName}")
	if err != nil {
		return
	}

	if !resp.IsSuccess() {
		err = fmt.Errorf("bad status code %q, body:%s", resp.StatusCode, resp.String())
		return
	}
	name = user.Name
	return
}
```

Let's write a unit test using httpmock:

```go
import (
  "github.com/imroc/req/v3"
  "github.com/jarcoal/httpmock"
  "net/http"
  "testing"
)

func TestGetUserName(t *testing.T) {
  client := req.C()
  httpmock.ActivateNonDefault(client.GetClient())
  httpmock.RegisterResponder("GET", "https://api.github.com/users/imroc", func(request *http.Request) (*http.Response, error) {
    respBody := `{"login":"imroc","id":7448852,"node_id":"MDQ6VXNlcjc0NDg4NTI=","avatar_url":"https://avatars.githubusercontent.com/u/7448852?v=4","gravatar_id":"","url":"https://api.github.com/users/imroc","html_url":"https://github.com/imroc","followers_url":"https://api.github.com/users/imroc/followers","following_url":"https://api.github.com/users/imroc/following{/other_user}","gists_url":"https://api.github.com/users/imroc/gists{/gist_id}","starred_url":"https://api.github.com/users/imroc/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/imroc/subscriptions","organizations_url":"https://api.github.com/users/imroc/orgs","repos_url":"https://api.github.com/users/imroc/repos","events_url":"https://api.github.com/users/imroc/events{/privacy}","received_events_url":"https://api.github.com/users/imroc/received_events","type":"User","site_admin":false,"name":"roc","company":"Tencent","blog":"https://imroc.cc","location":"China","email":null,"hireable":true,"bio":"I'm roc","twitter_username":"imrocchan","public_repos":137,"public_gists":0,"followers":407,"following":155,"created_at":"2014-04-30T10:50:46Z","updated_at":"2022-05-03T12:12:52Z"}`
    resp := httpmock.NewStringResponse(http.StatusOK, respBody)
    resp.Header.Set("Content-Type", "application/json; charset=utf-8")
    return resp, nil
  })
  name, err := GetUserName(client, "imroc")
  if err != nil {
    t.Error(err)
  }
  expectedName := "roc"
  if name != expectedName {
    t.Errorf("bad name result, expected %q, got %q", expectedName, name)
  }
}
```

## Write unit tests for the SDK

Taking the GitHub SDK in [Build SDK Quickly with Req](../build-sdk-quickly-with-req/) as an example, let's write a unit test for its `GetUserProfile` method:

```go
import (
	"github.com/imroc/req/v3"
	"github.com/jarcoal/httpmock"
	"net/http"
	"testing"
)

func TestClient_GetUserProfile(t *testing.T) {
	github := NewClient()
	httpmock.ActivateNonDefault(github.GetClient())
	httpmock.RegisterResponder("GET", "https://api.github.com/users/imroc", func(request *http.Request) (*http.Response, error) {
		respBody := `{"login":"imroc","id":7448852,"node_id":"MDQ6VXNlcjc0NDg4NTI=","avatar_url":"https://avatars.githubusercontent.com/u/7448852?v=4","gravatar_id":"","url":"https://api.github.com/users/imroc","html_url":"https://github.com/imroc","followers_url":"https://api.github.com/users/imroc/followers","following_url":"https://api.github.com/users/imroc/following{/other_user}","gists_url":"https://api.github.com/users/imroc/gists{/gist_id}","starred_url":"https://api.github.com/users/imroc/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/imroc/subscriptions","organizations_url":"https://api.github.com/users/imroc/orgs","repos_url":"https://api.github.com/users/imroc/repos","events_url":"https://api.github.com/users/imroc/events{/privacy}","received_events_url":"https://api.github.com/users/imroc/received_events","type":"User","site_admin":false,"name":"roc","company":"Tencent","blog":"https://imroc.cc","location":"China","email":null,"hireable":true,"bio":"I'm roc","twitter_username":"imrocchan","public_repos":137,"public_gists":0,"followers":407,"following":155,"created_at":"2014-04-30T10:50:46Z","updated_at":"2022-05-03T12:12:52Z"}`
		resp := httpmock.NewStringResponse(http.StatusOK, respBody)
		resp.Header.Set("Content-Type", "application/json; charset=utf-8")
		return resp, nil
	})
	user, err := github.GetUserProfile("imroc")
	if err != nil {
		t.Error(err)
	}
	expectedName := "roc"
	if user.Name != expectedName {
		t.Errorf("bad name result, expected %q, got %q", expectedName, user.Name)
	}
}
```

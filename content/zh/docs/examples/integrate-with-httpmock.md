---
title: "与 httpmock 集成"
description: "介绍如何将 req 集成到 httpmock 中"
lead: ""
draft: false
images: []
weight: 1009
menu:
  docs:
    parent: "examples"
toc: true
---

## 概述

[httpmock](https://github.com/jarcoal/httpmock) 经常用于 HTTP 相关的单元测试: 当你写完一个涉及到了远程 HTTP API 调用的功能，希望单元测试也能覆盖这部分逻辑，但如果在单元测试中对远程发起 HTTP 调用，在网络环境不通，或远程服务端 API 不可用时，单元测试就无法通过，此时我们可以使用 httpmock 来拦截我们的请求并直接返回我们所期望返回的数据，这样就可以在不经过网络传输的情况下直接完成 HTTP 相关的单元测试。

本文将介绍使用 `req` 开发的功能如何与 httpmock 集成来完成单元测试。

## 原理介绍

httpmock 主要是通过替换 `http.Client` 的 `Transport` 来实现请求拦截，让发起的 `Request` 不经过网络而直接根据 httpmock 的配置返回相应的 `Response`，`req` 的 `Client` 内部也是用的 `http.Client` 来发起请求，通过 `client.GetClient()` 可以获取到内部的 `http.Client`，我们将其传给 httpmock，让它去替换掉 `req` 默认的 `Transport` 就可以实现与 httpmock 集成来轻松开发单元测试代码。

> req 的 dump 能力与部分 debug 日志能力来自其自身实现的 Transport，httpmock 替换 Transport 后会丢失这部分的能力。

## 简单示例

假如我们开发了一个函数，用于获取指定 GitHub 账号的用户名:

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

我们来利用 httpmock 写个单元测试:

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

## 给 SDK 写单元测试

以 [使用 req 快速封装 SDK](../build-sdk-quickly-with-req/) 中的 GitHub SDK 为例，我们来为它的 `GetUserProfile` 方法写个单元测试:

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

---
title: "Integrate with OpenTelemetry and Jaeger"
description: "This article will introduce how to integrate req with OpenTelemetry and Jaeger"
lead: ""
draft: false
images: []
weight: 1100
menu:
  docs:
    parent: "examples"
toc: true
---

## Overview

In order to enhance the observability of Golang programs and help troubleshoot problems, we often integrate our code with the tracing framework. [Jaeger](https://www.jaegertracing.io/) is a more mainstream choice today, and tracing-related APIs are now abstracted into the [OpenTelemetry](https://opentelemetry.io/docs/instrumentation/go/getting-started/) project, covering various implementations, including Jaeger.

Using req's powerful middleware capabilities, we can easily integrate unified tracing capabilities for all http requests, and can be extended with a minimal code change.

This article will give an example of a runnable program: enter a GitHub username, display a brief introduction to the user, including the name, website, and the most popular open source projects under the user and the corresponding number of stars, the tracing information is reported to Jaeger for visual display.

Mainly include the following features:

* Built-in a GitHub SDK based on req.
* The `RequestMiddleware` and `ResponseMiddleware` of req are used in the SDK to uniformly handle API exceptions, and the implementation functions of the API call do not need to care about error handling.
* The SDK supports pass in a OpenTelemetry tracer to enable tracing, uses the client middleware capability of req to create a trace span before the request, and records the detailed information of the request and response into the span (URL, Method, request header, request body, response status code, response header, response body, etc.), and automatically end the span after the response ends.
* Trace is also used outside the SDK, and the trace context is passed layer by layer. You can view the complete and very detailed tracing information on the Jaeger UI.

## Init the Project

First create a directory and initialize the project with `go mod init`:

```bash
go mod init opentelemetry-jaeger-tracing
```

## Build a GitHub SDK that supports Tracing

Create a directory named `github` under the project root directory as the package of the built-in GitHub SDK, create the source file `github.go` in it, and write the code:

```go
package github

import (
  "context"
  "fmt"
  "github.com/imroc/req/v3"
  "go.opentelemetry.io/otel/attribute"
  "go.opentelemetry.io/otel/codes"
  "go.opentelemetry.io/otel/trace"
  "strconv"
  "strings"
)

// Client is the go client for GitHub API.
type Client struct {
  *req.Client
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

// NewClient create a GitHub client.
func NewClient() *Client {
  c := req.C().
    // All GitHub API requests need this header.
    SetCommonHeader("Accept", "application/vnd.github.v3+json").
    // All GitHub API requests use the same base URL.
    SetBaseURL("https://api.github.com").
    // EnableDump at the request level in request middleware which dump content into
    // memory (not print to stdout), we can record dump content only when unexpected
    // exception occurs, it is helpful to troubleshoot problems in production.
    OnBeforeRequest(func(c *req.Client, r *req.Request) error {
      if r.RetryAttempt > 0 { // Ignore on retry, no need to repeat EnableDump.
        return nil
      }
      r.EnableDump()
      return nil
    }).
    // Unmarshal response body into an APIError struct when status >= 400.
    SetCommonError(&APIError{}).
    // Handle common exceptions in response middleware.
    OnAfterResponse(func(client *req.Client, resp *req.Response) error {
      if resp.Err != nil { // There is an underlying error, e.g. network error or unmarshal error(SetResult or SetError was invoked before).
        if dump := resp.Dump(); dump != "" { // Append dump content to original underlying error to help troubleshoot.
          resp.Err = fmt.Errorf("%s\nraw content:\n%s", resp.Err.Error(), resp.Dump())
        }
        return nil // Skip the following logic if there is an underlying error.
      }
      if err, ok := resp.Error().(*APIError); ok { // Server returns an error message.
        // Convert it to human-readable go error.
        resp.Err = err
        return nil
      }
      // Corner case: neither an error response nor a success response,
      // dump content to help troubleshoot.
      if !resp.IsSuccess() {
        resp.Err = fmt.Errorf("bad response, raw content:\n%s", resp.Dump())
      }
      return nil
    })

  return &Client{
    Client: c,
  }
}
```

* Use the `Client` struct as the GitHub client, which is also the core struct of the SDK, with a built-in `*req.Client`.
* Use `SetCommonHeader` and `SetBaseURL` respectively to set a unified `Accept` request header and URL prefix for all GitHub API requests.
* The error format of the GitHub API response is unified. Use `SetCommonError` to tell req that if the response is an error (status code >= 400), the response body will be unmarshalled automatically to the object of the `APIError` struct.
* The `APIError` struct implements the go error interface, and converts the json API error message into a readable string.
* Set `ResponseMiddleware` in `OnAfterResponse`, when detecting an API response error, write it to `resp.Err`, and automatically throw it to the upper-layer caller as a go error.
* Set `RequestMiddleware` in `OnBeforeRequest` to enable request-level dump (temporarily stored in memory, not printed) for all requests, if you encounter underlying errors (such as timeout, dns failure, unmarshal failure), or receive an unknown status code (less than 200), in `ResponseMiddleware`, record the information (dump content) that is helpful for troubleshooting as much as possible to error, and write `resp.Err` to throw it to the upper caller.

Let's add tracing capabilities to `Client`:

```go
type apiNameType int

const apiNameKey apiNameType = iota

// SetTracer set the tracer of opentelemetry.
func (c *Client) SetTracer(tracer trace.Tracer) {
    c.WrapRoundTripFunc(func(rt req.RoundTripper) req.RoundTripFunc {
        return func(req *req.Request) (resp *req.Response, err error) {
            ctx := req.Context()
            apiName, ok := ctx.Value(apiNameKey).(string)
            if !ok {
                apiName = req.URL.Path
            }
            _, span := tracer.Start(req.Context(), apiName)
            defer span.End()
            span.SetAttributes(
                attribute.String("http.url", req.URL.String()),
                attribute.String("http.method", req.Method),
                attribute.String("http.req.header", req.HeaderToString()),
            )
            if len(req.Body) > 0 {
                span.SetAttributes(
                    attribute.String("http.req.body", string(req.Body)),
                )
            }
            resp, err = rt.RoundTrip(req)
            if err != nil {
                span.RecordError(err)
                span.SetStatus(codes.Error, err.Error())
            }
            if resp.Response != nil {
                span.SetAttributes(
                    attribute.Int("http.status_code", resp.StatusCode),
                    attribute.String("http.resp.header", resp.HeaderToString()),
                    attribute.String("http.resp.body", resp.String()),
                )
            }
            return
        }
    })
}
```

TODO: translation

* Pass OpenTelemetry's Tracer in `Client.SetTracer` to enable Tracing.
* Call `Client.WrapRoundTripFunc` to add Client middleware to ensure that the `resp` and `err` returned by `rt.RoundTrip(req)` are finally returned to the upper caller. Before `rt.RoundTrip(req)`, the request information can be recorded before the request is sent, and after `rt.RoundTrip(req)`, the response information can be recorded.
* In the middleware implementation function, a trace span is created for each request, and the API name is obtained from the context as the span name. If there is a parent span in the context, the current span will also automatically become its child span.
* Use `defer span.End()` to ensure that the span is ended after the response is end, so that tracing can count the time-consuming correctly.
* Record all the details of the request and response into the span, such as URL, Method, request header, request body, response status code, response header, response body, etc.
* If an error is detected, also log to the span and set the span's error state.

Let’s start implementing an API call. The first implementation is the API for getting GitHub user profile, the method is named `GetUserProfile`:

```go
func withAPIName(ctx context.Context, name string) context.Context {
	if ctx == nil {
		ctx = context.Background()
	}
	return context.WithValue(ctx, apiNameKey, name)
}

type UserProfile struct {
	Name string `json:"name"`
	Blog string `json:"blog"`
}

// GetUserProfile returns the user profile for the specified user.
// Github API doc: https://docs.github.com/en/rest/users/users#get-a-user
func (c *Client) GetUserProfile(ctx context.Context, username string) (user *UserProfile, err error) {
	err = c.Get("/users/{username}").
		SetPathParam("username", username).
		SetResult(&user).
		Do(withAPIName(ctx, "GetUserProfile")).Err
	return
}
```

* Tracing spans are passed through context, and the first parameter of each method uses context.
* Use chained methods to construct Request, `Get` means to create a `GET` request, and pass in the API path (previously `Client.SetCommonBaseURL` has set the URL prefix of all requests, here you can omit the prefix and write the path only), in the path There is also the `username` path parameter (REST style API), which is populated using the `SetPathParam` incoming variable.
* The format of the response body is the `UserProfile` struct, just pass the address of the nil pointer variable user in the return parameter into `SetResult`, indicating that if the request is success, an object of the `UserProfile` will be automatically created, and modify the pointer to point to that object , so that you don't even need to initialize the struct in advance, making the code more concise.
* Use the function `withAPIName` to put the API name into the context, and then call `Do` to send the request, pass the context in, so that the client middleware can get the API name and automatically use it as the span name.
* `Do` will return `*req.Response`, which is not nil in any case. If an error is returned during the request, it will be recorded in its `Err` field, we assign it to the `err` of the return parameter to throw error to the upper caller.

Next, add an API `ListUserRepo` to get the user's public repositories:

```go
type Repo struct {
    Name string `json:"name"`
    Star int    `json:"stargazers_count"`
}

// ListUserRepo returns a list of public repositories for the specified user
// Github API doc: https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user
func (c *Client) ListUserRepo(ctx context.Context, username string, page int) (repos []*Repo, err error) {
    err = c.Get("/users/{username}/repos").
        SetPathParam("username", username).
        SetQueryParamsAnyType(map[string]any{
            "type":      "owner",
            "page":      page,
            "per_page":  "100",
            "sort":      "updated",
            "direction": "desc",
        }).
        SetResult(&repos).
        Do(withAPIName(ctx, "ListUserRepo")).Err
    return
}

```

* The API supports pagination and requires username and page to be passed in.
* Page is an integer type and needs to be passed in query parameters. Use `SetQueryParamsAnyType` to pass in all query parameters without converting them into strings in advance.
* The rest is similar to the previous API implementation.

It can be seen that it becomes very easy for us to implement new API calls every time, because the middleware capabilities of req are used to uniformly handle exceptions and tracing. When implementing a new API call, we only need to pass in the necessary parameter and expected response body struct, there is no extra code, it is very intuitive and concise.

Well, as an example, we only need to implement two API calls. We can also add some useful methods to the Client:

```go
// LoginWithToken login with GitHub personal access token.
// GitHub API doc: https://docs.github.com/en/rest/overview/other-authentication-methods#authenticating-for-saml-sso
func (c *Client) LoginWithToken(token string) *Client {
	c.SetCommonHeader("Authorization", "token "+token)
	return c
}

// SetDebug enable debug if set to true, disable debug if set to false.
func (c *Client) SetDebug(enable bool) *Client {
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

* There is a rate limit if it's an anonymous user to invoke GitHub API. You can use a token to avoid that. Add `LoginWithToken` to support [personal access token] (https://docs.github.com/ en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
* Added `SetDebug` to support debug capabilities. When debug is enabled, the debug log of req and the original request and response content will be printed.

At this point, our GitHub SDK is complete.

## Main Function

下面，正式开始写可运行的示例程序。

在项目根目录下创建 `main.go`:

```go
package main

import (
	"context"
	"fmt"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/exporters/jaeger"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.12.0"
	"log"
	"opentelemetry-jaeger-tracing/github"
	"os"
)

const serviceName = "github-query"

var githubClient *github.Client
```

* 定义 `serviceName` 作为本服务的标识 (通常每个程序都是一个服务，上报 tracing 数据时，需标识服务名)，这里就定义为 `github-query`。
* 本示例程序需要调用 GitHub API 进行查询，使用前面我们封装的 GitHub SDK 作为 client，这里定义一个全局 `githubClient` 变量，内部函数直接使用该 client 进行调用。

使用 OpenTelemetry 进行链路追踪，需要创建一个 `TracerProvider`，这里我们定义 `traceProvider` 函数来创建包含 Jaeger 实现的 `TracerProvider`:

```go
func traceProvider() (*trace.TracerProvider, error) {
	// Create the Jaeger exporter
	ep := os.Getenv("JAEGER_ENDPOINT")
	if ep == "" {
		ep = "http://localhost:14268/api/traces"
	}
	exp, err := jaeger.New(jaeger.WithCollectorEndpoint(jaeger.WithEndpoint(ep)))
	if err != nil {
		return nil, err
	}

	// Record information about this application in a Resource.
	res, _ := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceNameKey.String(serviceName),
			semconv.ServiceVersionKey.String("v0.1.0"),
			attribute.String("environment", "test"),
		),
	)

	// Create the TraceProvider.
	tp := trace.NewTracerProvider(
		// Always be sure to batch in production.
		trace.WithBatcher(exp),
		// Record information about this application in a Resource.
		trace.WithResource(res),
		trace.WithSampler(trace.AlwaysSample()),
	)
	return tp, nil
}
```

* 使用 `JAEGER_ENDPOINT` 自定义 Jaeger 地址，默认使用本地测试的地址。
* 传入 `serviceName` 以便在 tracing 数据对本服务进行标识。

下面来写查询用户信息的主要函数 `QueryUser`:

```go
// QueryUser queries information for specified GitHub user, and display a
// brief introduction which includes name, blog, and the most popular repo.
func QueryUser(username string) error {
	ctx, span := otel.Tracer("query").Start(context.Background(), "QueryUser")
	defer span.End()

	span.SetAttributes(
		attribute.String("query.username", username),
	)
	profile, err := githubClient.GetUserProfile(ctx, username)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}
	span.SetAttributes(
		attribute.String("query.name", profile.Name),
		attribute.String("result.blog", profile.Blog),
	)
	repo, err := findMostPopularRepo(ctx, username)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}
	span.SetAttributes(
		attribute.String("popular.repo.name", repo.Name),
		attribute.Int("popular.repo.star", repo.Star),
	)
	fmt.Printf("The most popular repo of %s (%s) is %s, with %d stars\n", profile.Name, profile.Blog, repo.Name, repo.Star)
	return nil
}

func findMostPopularRepo(ctx context.Context, username string) (repo *github.Repo, err error) {
	ctx, span := otel.Tracer("query").Start(ctx, "findMostPopularRepo")
	defer span.End()

	for page := 1; ; page++ {
    var repos []*github.Repo
		repos, err = githubClient.ListUserRepo(ctx, username, page)
		if err != nil {
			return
		}
		if len(repos) == 0 {
			break
		}
		if repo == nil {
			repo = repos[0]
		}
		for _, rp := range repos[1:] {
			if rp.Star >= repo.Star {
				repo = rp
			}
		}
		if len(repos) == 100 {
			continue
		}
		break
	}

	if repo == nil {
		err = fmt.Errorf("no repo found for %s", username)
	}
	return
}
```

* `QueryUser` 需传入一个 username，以便查询指定 GitHub 用户的信息。
* 在函数开头创建一个名为 `QueryUser` 的 root span，作为链路追踪的初始 span。
* 在 span 中记录查询相关信息，包含查询的 username 以及查询到的昵称、blog 地址(使用 GetUserProfile 接口)，也包含该用户最火的开源项目及其 star 数量(使用 ListUserRepo 接口并进行计算对比得出)。
* 在函数末尾打印最终查询到的信息到控制台。
* 其中计算用户最火开源项目及其 star 数量由单独的 `findMostPopularRepo` 函数来实现，该函数也有对应的 span。

主要的实现函数准备就绪，现在我们来写 main 函数:

```go
func main() {
    tp, err := traceProvider()
    if err != nil {
        panic(err)
    }
    otel.SetTracerProvider(tp)

    githubClient = github.NewClient()
    if os.Getenv("DEBUG") == "on" {
        githubClient.SetDebug(true)
    }
    if token := os.Getenv("GITHUB_TOKEN"); token != "" {
        githubClient.LoginWithToken(token)
    }
    githubClient.SetTracer(otel.Tracer("github"))

    sigs := make(chan os.Signal, 1)
    signal.Notify(sigs, syscall.SIGTERM, syscall.SIGINT)
    go func() {
        sig := <-sigs
        fmt.Printf("Caught %s, shutting down\n", sig)
        if err := tp.Shutdown(context.Background()); err != nil {
            log.Fatal(err)
        }
        os.Exit(0)
    }()

    for {
        var name string
        fmt.Printf("Please give a github username: ")
        _, err := fmt.Fscanf(os.Stdin, "%s\n", &name)
        if err != nil {
            panic(err)
        }
        err = QueryUser(name)
        if err != nil {
            fmt.Println(err.Error())
        }
    }
}
```

* 调用 `traceProvider()` 创建一个 `TraceProvider`，并使用 `otel.SetTracerProvider(tp)` 设置到全局共享，以便前面其它函数调用 `otel.Tracer(xx)` 能够使用此 provider 来创建与获取 tracer。
* 调用 `github.NewClient()` 为全局的 `githubClient` 进行初始化。
* 判断环境变量，如果 `DEBUG=on` 则开启 Debug，如果提供 `GITHUB_TOKEN` 则将其设置给所有请求。
* 使用 `githubClient.SetTracer(otel.Tracer("github"))` 来为 GitHub 的 Client 启用 Tracing 能力，用名为 `gihtub` 的 tracer 标识 SDK 中产生的 tracing 信息。
* 处理 `SIGTERM` 和 `SIGTNT` 信号以实现优雅终止，在程序退出前关闭 `TraceProvider`，确保 trace 数据上报完再退出 (如果程序不是常驻运行，可以在 main 函数中用 defer 语句关闭 `TraceProvider`)。
* 主体是一个 for 死循环: 获取用户输入的 username，然后调用 `QueryUser` 查询并展示用户信息。

大功告成，下面我们来运行一下看看效果。

## Run and Result

首先按照 Jaeger 官方文档 [Getting Started](https://www.jaegertracing.io/docs/getting-started/) 在本地启动一个 Jaeger。

然后在项目根目录运行 `go run .` 运行程序，输入一个 GitHub 用户名（如 `spf13`），不出意外的话，会自动展示该用户的简短介绍:

```bash
$ go run .
Please give a github username: spf13
The most popular repo of Steve Francia (http://spf13.com) is cobra, with 28044 stars
```

然后使用浏览器进入 Jaeger UI 界面（http://127.0.0.1:16686/）来查看 Tracing 详情:

<img src="/images/jaeger-ui-success-overview.png">

可以清晰的看到函数调用链路与耗时信息:

```bash
QueryUser (3.27s)
   |
   |----> GetUserProfile (1.1s)
   |----> findMostPopularRepo (2.16s)
                  |
                  |----> ListUserRepo (1.17s)
                  |----> ListUserRepo (453.24ms)
```

> `ListUserRepo` 调用两次是因为分页查询用户 repo 时一页没查询完，分成了两次查询。

点进 `QueryUser` 的 span 详情，可以看到我们在函数内记录的查询与结果信息:

<img src="/images/jaeger-ui-queryuser-detail.png">

再点进 `GetUserProfile` 这个 SDK 产生的 span 详情，可以看到我们在中间件统一记录的 URL、Method、请求头、响应状态码、响应头、响应体等信息全都在这里，非常详细:

<img src="/images/jaeger-ui-getuserprofile-1.png">

<img src="/images/jaeger-ui-getuserprofile-2.png">

不断输入其它 username 测试，经过多次后可能会因 GitHub 的 API 限频导致异常:

```bash
$ go run .
Please give a github username: spf13
API error: API rate limit exceeded for 43.132.98.44. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.) (see doc https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting)
```

检查下 Jaeger UI，可以看到很详细很显眼的错误信息：

<img src="/images/jaeger-ui-getuserprofile-3.png">

此时，你可以将你的 GitHub 账号 [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) 写到环境变量来避免被限频:

```bash
export GITHUB_TOKEN=*******
```

尝试输入一个不存在的用户:

```bash
$ go run .
Please give a github username: kjtlejkdglfjsadhfajfsa
API error: Not Found (see doc https://docs.github.com/rest/reference/users#get-a-user)
```

检查下 Jaeger UI，同样的也可以看到详细的错误信息:

<img src="/images/jaeger-ui-getuserprofile-4.png">

如果断开公网测试，可能会报 dns 解析失败的错:

```go
$ go run .
Please give a github username: imroc
Get "https://api.github.com/users/imroc": dial tcp: lookup api.github.com: no such host
```

<img src="/images/jaeger-ui-getuserprofile-5.png">

或者连接超时的错:

```go
$ go run .
Please give a github username: spf13
Get "https://api.github.com/users/spf13": dial tcp 20.205.243.168:443: connect: operation timed out
```

<img src="/images/jaeger-ui-getuserprofile-6.png">

## Complete Code

本文涉及的完整代码已放入 req 官方 examples 下的 [opentelemetry-jaeger-tracing](https://github.com/imroc/req/tree/master/examples/opentelemetry-jaeger-tracing) 目录。

## Summary

如果业务程序中需要调用其它服务的 API，我们可以利用 req 强大的中间件能力，统一处理所有请求的异常，统一记录所有请求详细信息到 Tracing 系统，写出健壮、可观测性强且极易扩展的 SDK 与业务代码。

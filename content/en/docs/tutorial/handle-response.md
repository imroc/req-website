---
title: "Handle Response"
description: "This article will introduce how to handle response."
draft: false
images: []
weight: 145
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Check If the Request is Successful

To check if a request is successful, first check if an error has occurred:

```go
resp, err := client.R().Get(url)
if err != nil {
    log.Fatal(err)
}
```

If you use the following style, you can also check `resp.Err` to see if an error has occurred:

```go
resp := client.Get(url).Do()
if resp.Err != nil {
    log.Fatal(err)
}
```

> The returned "resp" will never be nil in any case, so it is safe to judge it directly.

If no error occurs, and then determine whether the status code is abnormal, the general status code between 200~299 means it is a successful response, you can judge it like this:

```go
if resp.IsSuccessState() {
	...
}
```

If the status code is greater than or equal to 400, it means that the server has responded to an error message, you can judge it like this:

```go
if resp.IsErrorState() {
  ...
}
```

Other conditions are generally unusual and unknown exceptions.

It is generally recommended to use middleware to uniformly handle exceptions for all requests to avoid duplication of code, refer to [Handle Exceptions with Middleware](../../examples/handle-exceptions-with-middleware/).

## req.Response and http.Response

After the request is sent, a `req.Response` is returned, which represents the HTTP response, and the original `*http.Response` returned by the underlying [Transport](https://pkg.go.dev/github.com/imroc/req/v3#Transport) is embedded in it, so we can directly access `http.Response`'s fields in `req.Response`, for example, when checking the status code, you can abbreviate `resp.Response.StatusCode` as `resp.StatusCode`:

```go
resp, err := client.R().Get(url)
if err != nil {
    log.Fatal(err)
}
if resp.StatusCode != http.StatusOK {
	...
}
```

When no error occurs, `resp.Response` is nil. If you still want to access `resp.StatusCode` or `resp.Header`, it will cause panic, in this case, you can use safer methods like `resp.GetStatusCode()` and `resp.GetHeader(key)`.

## Get Response Body as string or []byte

You can use `resp.String()` or `resp.Bytes()` to get the response body which has been automatically read into memory (see [Auto-Read Response Body](#auto-read-response-body)):

```go
resp, err := client.R().Get(url)
if err != nil {
    log.Fatal(err)
}
body := resp.String()
fmt.Println("body:", body)
```

Similarly, you can use `resp.ToString()` or `resp.ToBytes()` go get response body in case it wasn't automatically read into memory before:

```go
body, err := resp.ToString()
if err != nil {
    log.Fatal(err)
}
fmt.Println("body:", body)
```

## Unmarshal Response Body

You can use `SetSuccessResult` and `SetErrorResult` to unmarshal response body into struct or map:

```go
resp, err := client.R().
    SetSuccessResult(&result).
    SetErrorResult(&errMsg).
    Get(url)
```

* If `resp.IsSuccessState()` returns true, it means that the response body must have been unmarshalled into `&result`, which condition is status code between 200 and 299.
* If `resp.IsErrorState()` returns true, it means that the response body must have been unmarshalled into `&errMsg`, which condition is status code >= 400.

We can handle response like this:

```go
if err != nil { // Could be network error or unmarshal error
    // Handle error
    // ...
    return
}
if resp.IsSuccessState() {
    name := result.Name
    // ...
}else if resp.IsErrorState() {
    msg := errMsg.Message
    // ...
} else { // Bad status
    status := resp.Status
    // ...
}
```

You can also use `resp.Unmarshal` or `resp.Into` to unmarshal explicitly if you want:

```go
if resp.IsSuccessState() {
    err = resp.Into(&user)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("%s's blog is %s\n", user.Name, user.Blog)
} else {
    fmt.Println("bad response:", resp)
}
```

`Request.SetSuccessResult`, `Request.SetErrorResult`, `Response.Unmarshal` and `Response.Into`, all accepts the pointer to nil pointer, so that when the function needs to return a pointer of the struct according to the response body, it can directly pass in the address of the pointer variable defined by the function's return list (no need to create struct explicitly, which is automatically created internally using reflection), it is especially useful when building the SDK:

```go
func (c *GithubClient) GetMyProfile() (user *UserProfile, err error) {
	_, err = c.R().
		SetSuccessResult(&user).
		Get("/user")
	return
}
```

```go
func (c *GithubClient) GetMyProfile() (user *UserProfile, err error) {
	err = c.Get("/user").
		Do().
		Into(&user)
	return
}
```


## Auto-Read Response Body

Response body will be read into memory if it's not a download request by default, you can disable it if you want (normally you don't need to do this).

```go
client.DisableAutoReadResponse()

resp, err := client.R().Get(url)
if err != nil {
	log.Fatal(err)
}
io.Copy(dst, resp.Body)
```

## Combine With gjson to Get Json Fields Easily

If the returned response body is in json format, you want to get the value of the specified fields, but you don't want to define a struct to unmarshal to get the value of the field, you can combine [gjson](https://github.com/tidwall/gjson) to get the value of the specified fields.

Code example:

```go
package main

import (
  "fmt"
  "github.com/imroc/req/v3"
  "github.com/tidwall/gjson"
)

type Response struct {
  *req.Response
}

func (resp Response) GetJsonStringField(path string) string {
  result := gjson.Get(resp.String(), path)
  return result.String()
}

func (resp Response) GetJsonStringArrayField(path string) (ret []string) {
  result := gjson.Get(resp.String(), path)
  for _, item := range result.Array() {
    ret = append(ret, item.String())
  }
  return ret
}

func main() {
  req.EnableDumpAllWithoutRequest()
  resp := Response{req.MustGet("https://httpbin.org/json")}

  topic := resp.GetJsonStringField("slideshow.title")
  slidesTitles := resp.GetJsonStringArrayField("slideshow.slides.#.title")

  fmt.Println("The topic is", topic)
  for i, title := range slidesTitles {
    fmt.Printf("Slide %d is %s\n", i+1, title)
  }
}
```

Run it:

```txt
$ go run .
:status: 200
date: Fri, 26 Aug 2022 05:43:15 GMT
content-type: application/json
content-length: 429
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

{
  "slideshow": {
    "author": "Yours Truly",
    "date": "date of publication",
    "slides": [
      {
        "title": "Wake up to WonderWidgets!",
        "type": "all"
      },
      {
        "items": [
          "Why <em>WonderWidgets</em> are great",
          "Who <em>buys</em> WonderWidgets"
        ],
        "title": "Overview",
        "type": "all"
      }
    ],
    "title": "Sample Slide Show"
  }
}

The topic is Sample Slide Show
Slide 1 is Wake up to WonderWidgets!
Slide 2 is Overview
```

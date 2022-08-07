---
title: "Read and Unmarshal Response"
description: "This article will introduce how to read response."
draft: false
images: []
weight: 280
menu:
  docs:
    parent: "tutorial"
toc: true
---

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

You can use `SetResult` and `SetError` to unmarshal response body into struct or map:

```go
resp, err := client.R().
    SetResult(&result).
    SetError(&errMsg).
    Get(url)
```

* If `resp.IsSuccess()` returns true, it means that the response body must have been unmarshalled into `&result`, which condition is status code between 200 and 299.
* If `resp.IsError()` returns true, it means that the response body must have been unmarshalled into `&errMsg`, which condition is status code >= 400.

We can handle response like this:

```go
if err != nil { // Could be network error or unmarshal error
    // Handle error
    // ...
    return
}
if resp.IsSuccess() {
    name := result.Name
    // ...
}else if resp.IsError() {
    msg := errMsg.Message
    // ...
}else { // Bad status
    status := resp.Status
    // ...
}
```

You can also use `resp.Unmarshal` or `resp.Into` to unmarshal explicitly if you want:

```go
if resp.IsSuccess() {
    err = resp.Into(&user)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("%s's blog is %s\n", user.Name, user.Blog)
} else {
    fmt.Println("bad response:", resp)
}
```

`SetResult`, `Request.SetError`, `Response.Unmarshal` and `Response.Into`, all accepts the pointer to nil pointer, so that when the function needs to return a pointer of the struct according to the response body, it can directly pass in the address of the pointer variable defined by the function's return list (no need to create struct explicitly, which is automatically created internally using reflection), it is especially useful when building the SDK:

```go
func (c *GithubClient) GetMyProfile() (user *UserProfile, err error) {
	_, err = c.R().SetResult(&user).Get("/user")
	return
}
```

## Get http.Response

`http.Response` is embedded into the `Response` of req, so you can access the `Response` of req as `http.Response`:

```go
resp, err := req.Get("https://httpbin.org/get")
if err != nil {
    log.Fatal(err)
}
fmt.Println("status", resp.Status)
fmt.Println("server:", resp.Header.Get("server"))
fmt.Println("content-length:", resp.ContentLength)
```

```txt
status 200 OK
server: gunicorn/19.9.0
content-length: 289
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

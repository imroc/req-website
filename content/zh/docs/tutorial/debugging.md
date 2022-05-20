---
title: "调试 - Dump/Log/Trace"
description: "Req 提供了强大便捷的调试工具，包括调试日志、性能跟踪，甚至可以 dump 完整的请求和响应内容。"
lead: "Req 提供了强大便捷的调试工具，包括调试日志、性能跟踪，甚至可以 dump 完整的请求和响应内容。"
draft: false
images: []
weight: 100
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Dump 请求和响应内容

在客户端启用 Dump，默认会 dump 所有请求和响应的内容:

```go
client := req.C().EnableDumpAll()
client.R().Get("https://httpbin.org/get")
```

```txt
:authority: httpbin.org
:method: GET
:path: /get
:scheme: https
user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36
accept-encoding: gzip

:status: 200
date: Wed, 26 Jan 2022 06:39:20 GMT
content-type: application/json
content-length: 372
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

{
  "args": {},
  "headers": {
    "Accept-Encoding": "gzip",
    "Host": "httpbin.org",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
    "X-Amzn-Trace-Id": "Root=1-61f0ec98-5958c02662de26e458b7672b"
  },
  "origin": "103.7.29.30",
  "url": "https://httpbin.org/get"
}
```

更高级的 Dump 设置:

```go
// Customize dump settings with predefined and convenient settings at client level.
client.EnableDumpAllWithoutBody(). // Only dump the header of request and response
    EnableDumpAllAsync(). // Dump asynchronously to improve performance
    EnableDumpAllToFile("reqdump.log") // Dump to file without printing it out
// Send request to see the content that have been dumped
client.R().Get(url)

// Enable dump with fully customized settings at client level.
opt := &req.DumpOptions{
            Output:         os.Stdout,
            RequestHeader:  true,
            ResponseBody:   true,
            RequestBody:    false,
            ResponseHeader: false,
            Async:          false,
        }
client.SetCommonDumpOptions(opt).EnableDumpAll()
client.R().Get("https://httpbin.org/get")

// Change settings dynamically
opt.ResponseBody = false
client.R().Get("https://httpbin.org/get")
```

你还可以在请求级别启用 Dump，它不会覆盖客户端级别的 Dump 设置，默认将内容存到内部 buffer 而不打印到标准输出，可以按需调用 `Response.Dump()` 来获取 Dump 内容，通常在生产中使用，仅在请求异常时记录请求的内容，以帮助我们排查问题:

```go
resp, err := client.R().EnableDump().SetBody("test body").Post("https://httpbin.org/post")
    fmt.Println("err:", err)
	  if resp.Dump() != "" {
        fmt.Println("raw content:")
        fmt.Println(resp.Dump()) // Record raw content when error happens.
    }
    return
}
if !resp.IsSuccess() { // Status code not between 200 and 299
    fmt.Println("bad status:", resp.Status)
    fmt.Println("raw content:")
    fmt.Println(resp.Dump()) // Record raw content when status code is abnormal.
    return
}

// Similarly, also support to customize dump settings with the predefined and convenient settings at request level.
resp, err = client.R().
	EnableDumpWithoutRequest().
	SetBody("test body").
	Post("https://httpbin.org/post")
// ...
resp, err = client.R().
	SetDumpOptions(opt).
	EnableDump().
	SetBody("test body").
	Post("https://httpbin.org/post")
```

## 启用 DebugLog 来分析请求过程

日志默认是启用的，但不包括 Debug 级别日志，仅 Warning 和 Error 类型日志。

使用 `EnableDebugLog()` 可以启用 Debug 级别日志：

```go
client := req.C().EnableDebugLog()
client.R().Get("http://baidu.com/s?wd=req")
```

```txt
2022/05/20 10:26:51.213205 DEBUG [req] HTTP/1.1 GET http://baidu.com/s?wd=req
2022/05/20 10:26:51.353801 DEBUG [req] charset iso-8859-1 detected in Content-Type, auto-decode to utf-8
2022/05/20 10:26:51.353866 DEBUG [req] <redirect> GET http://www.baidu.com/s?wd=req
2022/05/20 10:26:51.367173 DEBUG [req] HTTP/1.1 GET http://www.baidu.com/s?wd=req
```

你也可以对 Logger 进行更高级的自定义:

```go
// SetLogger with nil to disable all log, including warning and error logs.
client.SetLogger(nil)

// Or customize the logger with your own implementation.
client.SetLogger(logger)
```

## 启用 Trace 来分析性能瓶颈

你可以在请求级别或客户端级别启用 Trace 来分析性能瓶颈，下面是在请求级别启用的示例:

```go
// Enable trace at request level
client := req.C()
resp, err := client.R().EnableTrace().Get("https://api.github.com/users/imroc")
if err != nil {
	log.Fatal(err)
}
trace := resp.TraceInfo() // Use `resp.Request.TraceInfo()` to avoid unnecessary struct copy in production.
fmt.Println(trace.Blame()) // Print out exactly where the http request is slowing down.
fmt.Println("----------")
fmt.Println(trace) // Print details
```

```txt
the request total time is 2.562416041s, and costs 1.289082208s from connection ready to server respond frist byte
--------
TotalTime         : 2.562416041s
DNSLookupTime     : 445.246375ms
TCPConnectTime    : 428.458µs
TLSHandshakeTime  : 825.888208ms
FirstResponseTime : 1.289082208s
ResponseTime      : 1.712375ms
IsConnReused:     : false
RemoteAddr        : 98.126.155.187:443
```

类似地，下面是在客户端级别启用 Trace 的示例:

```go
// Enable trace at client level
client.EnableTraceAll()
resp, err = client.R().Get(url)
// ...
```

## DevMode

如果你想要启用所有调试的特性(Dump, DebugLog, Trace)，直接调用 `Client` 的 `DevMode` 方法:

```go
client := req.C().DevMode()
client.R().Get("https://httpbin.org/get")
```

---
title: "Debugging - Dump/Log/Trace"
description: "Req provides powerful and convenient debug utilities, including debug logs, performance traces, and even dump the complete request and response content."
lead: "Req provides powerful and convenient debug utilities, including debug logs, performance traces, and even dump the complete request and response content."
draft: false
images: []
weight: 100
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Dump the Content

Enable dump at client level, which will dump for all requests, including all content of request and response and output to stdout by default:

```go
client := req.C().EnableDumpAll()
client.R().Get("https://httpbin.org/get")
```

```txt
:authority: httpbin.org
:method: GET
:path: /get
:scheme: https
user-agent: req/v3 (https://github.com/imroc/req/v3)
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
    "User-Agent": "req/v3 (https://github.com/imroc/req/v3)",
    "X-Amzn-Trace-Id": "Root=1-61f0ec98-5958c02662de26e458b7672b"
  },
  "origin": "103.7.29.30",
  "url": "https://httpbin.org/get"
}
```

More advanced dump settings:

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

You can also enable dump at request level, which will not override the client-level dump setting, it will dump to the internal buffer and do not print to stdout by default, you can call `Response.Dump()` to get the dump result and print only if you want to, typically used in production, only record the content of the request when the request is abnormal to help us troubleshoot problems.

```go
resp, err := client.R().EnableDump().SetBody("test body").Post("https://httpbin.org/post")
    fmt.Println("err:", err)
	  if resp.Dump() != "" {
        fmt.Println("raw content:")
        fmt.Println(resp.Dump()) // Record raw content when error happens.
    }
    return
}
if !resp.IsSuccessState() { // Status code not between 200 and 299
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

In some scenarios, such as web scanners, if you need to obtain the original request and response content separately, you need to dump them separately. In this case, you can use `SetDumpOptions` to set more fine-grained dump options to dump different parts of the content to different `io.Writer`:

```go
var reqBuf, respBuf bytes.Buffer
resp, err := client.R().
  EnableDump().
  SetDumpOptions(&req.DumpOptions{
    RequestOutput:  &reqBuf,
    ResponseOutput: &respBuf,
    RequestHeader:  true,
    RequestBody:    true,
    ResponseHeader: true,
    ResponseBody:   true,
  }).
  SetBody("test body").
  Post("https://httpbin.org/post")
if err != nil {
	...
}

fmt.Println("request content:")
fmt.Println(reqBuf.String())
fmt.Println("\n======\n")
fmt.Println("response content:")
fmt.Println(respBuf.String())
```

## Enable DebugLog for Deeper Insights

Logging is enabled by default, but only output the warning and error message.

Use `EnableDebugLog()` to enable debug level logging:

```go
client := req.C().EnableDebugLog()
client.R().Get("http://baidu.com/s?wd=req")
```

```txt
2022/01/26 15:46:29.279368 DEBUG [req] GET http://baidu.com/s?wd=req
2022/01/26 15:46:29.469653 DEBUG [req] charset iso-8859-1 detected in Content-Type, auto-decode to utf-8
2022/01/26 15:46:29.469713 DEBUG [req] <redirect> GET http://www.baidu.com/s?wd=req
```

And you can also customize the Logger:

```go
// SetLogger with nil to disable all log, including warning and error logs.
client.SetLogger(nil)

// Or customize the logger with your own implementation.
client.SetLogger(logger)
```

## Enable Trace to Analyze Performance

You can enable trace at request-level or client-level to analyze performance:

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
the request total time is 2.562416041s, and costs 1.289082208s from connection ready to server respond first byte
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

```go
// Enable trace at client level
client.EnableTraceAll()
resp, err = client.R().Get(url)
// ...
```

## DevMode

If you want to enable all debug features (dump, debug log and tracing), just call `DevMode()`:

```go
client := req.C().DevMode()
client.R().Get("https://httpbin.org/get")
```

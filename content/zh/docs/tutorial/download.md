---
title: "下载"
description: "介绍如何进行下载"
draft: false
images: []
weight: 320
menu:
  docs:
    parent: "tutorial"
toc: true
---

## 下载到文件

使用 `Request.SetOutputFile` 将响应体内容下载到指定文件:

```go
client := req.C()

// Download to the absolute file path.
client.R().SetOutputFile("/tmp/test.jpg").Get(url)
```

使用 `Client.SetOutputDirectory` 设置默认下载目录:

```go
client := req.C().SetOutputDirectory("/path/to/download")

// Download to relative file path, this will be downloaded to /path/to/download/test.jpg
client.R().SetOutputFile("test.jpg").Get(url)
```

## 下载到 io.Writer

使用 `Request.SetOutput` 可以将响应体内容下载到指定的 `io.Writer`:

```go
client := req.C()

// Download to the specific io.Writer
client.R().SetOutput(w).Get(url)
```

## 使用 Download Callback

如果想要显示下载进度，可以使用 `SetDownloadCallback` 设置回调:

```go
client := req.C()
size := 100 * 1024 // 100 KB
url := fmt.Sprintf("https://httpbin.org/bytes/%d", size)
callback := func(info req.DownloadInfo) {
    fmt.Printf("downloaded %.2f%%\n", float64(info.DownloadedSize)/float64(info.Response.ContentLength)*100.0)
}

client.R().
    SetOutputFile("testfile").
    SetDownloadCallback(callback).
    Get(url)
```

```txt
downloaded 17.48%
downloaded 43.70%
downloaded 100.00%
```

> 当响应体长度未知时，`info.Response.ContentLength` 可能为 0。

`DownloadCallback` 默认至少 200ms 执行一次，你也可以使用  `SetDownloadCallbackWithInterval` 来自定义最少执行间隔时长:

```go
client.R().
    SetOutputFile("testfile").
    SetDownloadCallbackWithInterval(callback, 2*time.Millisecond).
    Get(url)
```

```txt
downloaded 16.74%
downloaded 40.74%
downloaded 48.74%
downloaded 72.74%
downloaded 80.74%
downloaded 100.00%
```

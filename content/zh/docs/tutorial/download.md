---
title: "Download"
description: "This article will introduce how to download."
draft: false
images: []
weight: 320
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Download to File

Use `Request.SetOutputFile` to download response body to specific file:

```go
client := req.C()

// Download to the absolute file path.
client.R().SetOutputFile("/tmp/test.jpg").Get(url)
```

Use `Client.SetOutputDirectory` to set the default path that file will be downloaded to:

```go
client := req.C().SetOutputDirectory("/path/to/download")

// Download to relative file path, this will be downloaded to /path/to/download/test.jpg
client.R().SetOutputFile("test.jpg").Get(url)
```

## Download to io.Writer

Use `Request.SetOutput` to download response body to specific `io.Writer`:

```go
client := req.C()

// Download to the specific io.Writer
client.R().SetOutput(w).Get(url)
```

## Use Download Callback

You can set `DownloadCallback` if you want to show download progress:

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

> `info.Response.ContentLength` could be 0 when the total size is unknown.

`DownloadCallback` will be invoked at least every 200ms by default, you can customize the minimal invoke interval using `SetDownloadCallbackWithInterval`:

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

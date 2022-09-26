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

## Parallel Download

Req supports multiple goroutines to download different segments of the same file concurrently, and finally merges different segments into one single file to speed up the download.

> **Attention:** The factors affecting the download speed are very complex. Concurrent downloads may not necessarily speed up the download, or even slow down. In some cases, adjusting the concurrency and segment size can increase the speed, depending on the situation.

Example `main.go`:

```go
package main

import (
	"github.com/imroc/req/v3"
)

func main() {
	client := req.C().EnableDebugLog()
	err := client.NewParallelDownload("https://get.helm.sh/helm-v3.10.0-darwin-amd64.tar.gz").
		SetConcurrency(5).
		SetSegmentSize(1024 * 1024 * 3). // 3MB
		SetOutputFile("helm.tar.gz").
		SetFileMode(0777).
		SetTempRootDir("temp").
		Do()
	if err != nil {
		panic(err)
	}
}
```

Run:

```bash
$ go run .
2022/09/26 11:56:00.518072 DEBUG [req] use temporary directory temp/a3bed2850f816394f9c7a18d256aafb2
2022/09/26 11:56:00.518224 DEBUG [req] download with 5 concurrency and 3145728 bytes segment size
2022/09/26 11:56:02.648973 DEBUG [req] HTTP/2 HEAD https://get.helm.sh/helm-v3.10.0-darwin-amd64.tar.gz
2022/09/26 11:56:03.537144 DEBUG [req] downloading segment 12582912-15237556
2022/09/26 11:56:03.537378 DEBUG [req] downloading segment 6291456-9437183
2022/09/26 11:56:03.537674 DEBUG [req] downloading segment 9437184-12582911
2022/09/26 11:56:03.537810 DEBUG [req] HTTP/2 GET https://get.helm.sh/helm-v3.10.0-darwin-amd64.tar.gz
2022/09/26 11:56:03.537821 DEBUG [req] HTTP/2 GET https://get.helm.sh/helm-v3.10.0-darwin-amd64.tar.gz
2022/09/26 11:56:03.537157 DEBUG [req] downloading segment 0-3145727
2022/09/26 11:56:03.538179 DEBUG [req] downloading segment 3145728-6291455
2022/09/26 11:56:03.538243 DEBUG [req] HTTP/2 GET https://get.helm.sh/helm-v3.10.0-darwin-amd64.tar.gz
2022/09/26 11:56:03.538364 DEBUG [req] HTTP/2 GET https://get.helm.sh/helm-v3.10.0-darwin-amd64.tar.gz
2022/09/26 11:56:03.538685 DEBUG [req] HTTP/2 GET https://get.helm.sh/helm-v3.10.0-darwin-amd64.tar.gz
2022/09/26 11:56:05.409597 DEBUG [req] removing temporary directory temp/a3bed2850f816394f9c7a18d256aafb2
2022/09/26 11:56:05.410855 DEBUG [req] download completed from https://get.helm.sh/helm-v3.10.0-darwin-amd64.tar.gz to helm.tar.gz

$ tar -zxvf helm.tar.gz
x darwin-amd64/
x darwin-amd64/helm
x darwin-amd64/LICENSE
x darwin-amd64/README.md

$ ./darwin-amd64/helm version
version.BuildInfo{Version:"v3.10.0", GitCommit:"ce66412a723e4d89555dc67217607c6579ffcb21", GitTreeState:"clean", GoVersion:"go1.18.6"}
```

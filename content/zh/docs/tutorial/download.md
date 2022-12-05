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
    if info.Response.Response != nil {
        fmt.Printf("downloaded %.2f%%\n", float64(info.DownloadedSize)/float64(info.Response.ContentLength)*100.0)
    }
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

## 并发下载

req 支持多协程并发下载同一文件的不同分片，最终合并成一个文件来实现下载加速。

> **请注意:** 下载速度影响因素很复杂，并发下载不一定就能加速下载，甚至可能降速，在某些情况调整并发和分段大小可以提速，需视情况而定

示例 `main.go`:

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

运行:

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

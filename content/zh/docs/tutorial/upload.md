---
title: "上传"
description: "介绍如何进行上传"
lead: ""
draft: false
images: []
weight: 320
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Multipart Upload

使用 `SetFile` or `SetFiles` 将文件加到 Multipart 表单进行上传:

```go
client := req.C()

client.R().
    SetFile("pic", "test.jpg"). // Set form param name and filename
    SetFile("pic", "/path/to/roc.png"). // Multiple files using the same form param name
    SetFiles(map[string]string{ // Set multiple files using map
        "exe": "test.exe",
        "src": "main.go",
    }).
    SetFormData(map[string]string{ // Set form data while uploading
        "name":  "imroc",
        "email": "roc@imroc.cc",
    }).
    Post("https://httpbin.org/post")
```

也可以使用 `SetFileBytes` 直接将 `[]byte` 作为文件内容进行上传:

```go
client.R().
    SetFileBytes("file", "test.txt", []byte("test content")).
    Post(url)
```

或使用 `SetFileReader` 将 `io.Reader` 作为文件内容进行上传:

```go
avatarImgFile, _ := os.Open("avatar.png")
client.R().
    SetFileReader("avatar", "avatar.png", avatarImgFile).
    Post(url)
```

## 使用 Upload Callback

如果想要显示上传进度，可以使用 `SetUploadCallback` 设置回调:

```go
client := req.C()
client.R().
	SetFile("excel", "test.xlsx").
	SetUploadCallback(func(info req.UploadInfo) {
        fmt.Printf("%q uploaded %.2f%%\n", info.FileName, float64(info.UploadedSize)/float64(info.FileSize)*100.0)
    }).Post("https://httpbin.org/post")
```

```txt
"test.xlsx" uploaded 7.44%
"test.xlsx" uploaded 29.78%
"test.xlsx" uploaded 52.08%
"test.xlsx" uploaded 74.47%
"test.xlsx" uploaded 96.87%
"test.xlsx" uploaded 100.00%
```

> 当设置了上传回调，默认会强制使用 chunked encoding 方式上传，等同于调用了 `EnableForceChunkedEncoding`。

`UploadCallback` 默认至少 200ms 执行一次, 你也可以使用 `SetUploadCallbackWithInterval` 来自定义最少执行间隔时长:

```go
client := req.C()
client.R().
    SetFile("excel", "test.xlsx").
    SetUploadCallbackWithInterval(func(info req.UploadInfo) {
        fmt.Printf("%q uploaded %.2f%%\n", info.FileName, float64(info.UploadedSize)/float64(info.FileSize)*100.0)
    }, 10 * time.Millisecond).
    Post("https://httpbin.org/post")
```

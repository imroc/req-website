---
title: "Upload"
description: "This article will introduce how to upload."
lead: "This article will introduce how to upload."
draft: false
images: []
weight: 320
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Multipart Upload

Use `SetFile` or `SetFiles` to add file into multipart form:

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

You can also use `SetFileBytes` to add `[]byte` as file content:

```go
client.R().
    SetFileBytes("file", "test.txt", []byte("test content")).
    Post(url)
```

Or use `SetFileReader` to add `io.Reader` as file content to upload:

```go
avatarImgFile, _ := os.Open("avatar.png")
client.R().
    SetFileReader("avatar", "avatar.png", avatarImgFile).
    Post(url)
```

## Use Upload Callback

Use `SetUploadCallback` if you want to show upload progress:

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

> When the upload callback is set, will force using chunked encoding, which is equivalent to calling `EnableForceChunkedEncoding`.

`UploadCallback` will be invoked at least every 200ms by default, you can customize the minimal invoke interval using `SetUploadCallbackWithInterval`:

```go
client := req.C()
client.R().
    SetFile("excel", "test.xlsx").
    SetUploadCallbackWithInterval(func(info req.UploadInfo) {
        fmt.Printf("%q uploaded %.2f%%\n", info.FileName, float64(info.UploadedSize)/float64(info.FileSize)*100.0)
    }, 10 * time.Millisecond).
    Post("https://httpbin.org/post")
```

---
title: "设置 URL 路径参数"
description: "Use url path parameter can replace the variable in the url path."
draft: false
images: []
weight: 180
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Request Level

Use `SetPathParam` or `SetPathParams` to set url path parameter at request-level:

```go
client := req.C().DevMode()

client.R().
    SetPathParam("owner", "imroc"). // Set a path param, which will replace the vairable in url path
    SetPathParams(map[string]string{ // Set multiple path params at once
        "repo": "req",
        "path": "README.md",
    }).Get("https://api.github.com/repos/{owner}/{repo}/contents/{path}") // path parameter will replace path variable in the url

```
```txt
2022/01/23 14:43:59.114592 DEBUG [req] GET https://api.github.com/repos/imroc/req/contents/README.md
...
```

## Client Level

Similarly, you can use `SetCommonPathParam` or `SetCommonPathParams` to set the common url path parameter for every request on client:

```go
client := req.C().DevMode().
	SetCommonPathParam(k1, v1).
	SetCommonPathParams(pathParams)

resp1, err := client.Get(url1)
...

resp2, err := client.Get(url2)
...
```

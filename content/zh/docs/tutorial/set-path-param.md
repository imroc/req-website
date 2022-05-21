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

## 在请求级别设置

使用 `SetPathParam` 或 `SetPathParams` 可以在请求级别设置 URL 路径参数以替换路径中的变量:

```go
client := req.C().EnableDebugLog().EnableDumpAllWithoutResponse()

client.R().
    SetPathParam("owner", "imroc"). // Set a path param, which will replace the vairable in url path
    SetPathParams(map[string]string{ // Set multiple path params at once
        "repo": "req",
        "path": "README.md",
    }).Get("https://api.github.com/repos/{owner}/{repo}/contents/{path}") // path parameter will replace path variable in the url

```

```txt
2022/05/20 10:59:22.916445 DEBUG [req] HTTP/2 GET https://api.github.com/repos/imroc/req/contents/README.md
:authority: api.github.com
:method: GET
:path: /repos/imroc/req/contents/README.md
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)
```

## 在客户端级别设置

类似的, 你可以使用 `SetCommonPathParam` 或 `SetCommonPathParams` 在客户端级别设置 URL 路径参数，对所有请求生效:

```go
client := req.C().DevMode().
    SetCommonPathParam(k1, v1).
    SetCommonPathParams(pathParams)

resp1, err := client.Get(url1)
...

resp2, err := client.Get(url2)
...
```

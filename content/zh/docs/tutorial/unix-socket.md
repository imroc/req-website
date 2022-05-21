---
title: "Unix Socket"
description: "介绍如何设置 Unix Socket"
draft: false
images: []
weight: 380
menu:
  docs:
    parent: "tutorial"
toc: true
---

如果你想指定 Unix Socket 而不用 TCP/IP，可以使用 `Client.SetUnixSocket` 进行设置:

```go
client := req.C()
client.SetUnixSocket("/var/run/custom.sock")
client.SetBaseURL("http://example.local")

resp, err := client.R().Get("/index.html")
```

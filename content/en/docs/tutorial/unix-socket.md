---
title: "Unix Socket"
description: "This article will introduce how to set unit socket."
draft: false
images: []
weight: 380
menu:
  docs:
    parent: "tutorial"
toc: true
---

If you want to access via a specific unix socket instead of TCP, use `Client.SetUnixSocket`:

```go
client := req.C()
client.SetUnixSocket("/var/run/custom.sock")
client.SetBaseURL("http://example.local")

resp, err := client.R().Get("/index.html")
```

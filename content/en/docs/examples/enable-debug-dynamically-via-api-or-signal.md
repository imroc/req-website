---
title: "Enable Debug Dynamically via API or Signal"
description: "Enable Debug Dynamically via API or Signal"
lead: ""
draft: false
images: []
weight: 1005
menu:
  docs:
    parent: "examples"
toc: true
---

## Signal Example

```go
package main

import (
	"fmt"
	"github.com/imroc/req/v3"
	"os"
	"os/signal"
	"syscall"
	"time"
)

var globalClient = req.C()

func main() {
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGUSR1, syscall.SIGUSR2)

	go func() {
		for sig := range sigs {
			switch sig {
			case syscall.SIGUSR1: // Enable debug by `kill -SIGUSR1 PID`
				globalClient.EnableDumpAll()
				globalClient.EnableDebugLog()
				fmt.Println("Debug is enabled")
			case syscall.SIGUSR2: // Disable debug by `kill -SIGUSR2 PID`
				globalClient.DisableDumpAll()
				globalClient.DisableDebugLog()
				fmt.Println("Debug is disabled")
			}
		}
	}()

	for {
		time.Sleep(5 * time.Second)

		var result struct {
			Uuid string `json:"uuid"`
		}

		resp, err := globalClient.R().
			SetResult(&result). // Read uuid response into struct.
			Get("https://httpbin.org/uuid")

		if err != nil {
			fmt.Println("ERROR:", err.Error())
			continue
		}

		if resp.IsSuccess() { // Print uuid returned by the API.
			fmt.Println(result.Uuid)
		} else {
			fmt.Println("bad status", resp.Status)
		}
	}
}
```

Run it:

```bash
$ ./test
3559ef3f-4a9e-4d08-969e-c92f5f8cd284
733d03b8-d680-4d65-aefc-27fb30e591c9
40af3a84-867e-4d2d-9cdb-aa1a16a52471
```

Enable debug  by `kill -SIGUSR1 PID`, and then look at the changes in the output:

```txt
Debug is enabled
2022/05/25 11:36:50.801032 DEBUG [req] HTTP/2 GET https://httpbin.org/uuid
:authority: httpbin.org
:method: GET
:path: /uuid
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 200
date: Wed, 25 May 2022 03:36:51 GMT
content-type: application/json
content-length: 53
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

{
  "uuid": "733d03b8-d680-4d65-aefc-27fb30e591c9"
}

733d03b8-d680-4d65-aefc-27fb30e591c9
```

Disable debug  by `kill -SIGUSR2 PID`, and then look at the changes in the output again:

```txt
Debug is disabled
90b7648f-b195-44d4-80e4-7ab84a0b06b8
dd193d44-f0e6-40c4-b804-a36b5890a048
df0d8c10-1615-4b5f-b444-1453a7b0128b
```

---
title: "通过命令行标志或环境变量开启 Debug"
description: "介绍如何通过命令行标志或环境变量开启 Debug"
lead: ""
draft: false
images: []
weight: 1000
menu:
  docs:
    parent: "examples"
toc: true
---

## Cobra 示例

使用 `cobra` 创建一个 golang 命令行工具，通过全局 `--debug=true` 标志或 `DEBUG=true` 环境变量开启 Debug 模式：

```go
package main

import (
	"fmt"
	"github.com/imroc/req/v3"
	"github.com/spf13/cobra"
	"log"
	"os"
)

var globalClient = req.C()

var enableDebug bool

var uuidCmd = cobra.Command{
	Use: "uuid",
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		if enableDebug { // Enable debug mode if `--enableDebug=true` or `DEBUG=true`.
			globalClient.EnableDumpAll()  // Dump all requests.
			globalClient.EnableDebugLog() // Output debug log.
		}
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		var result struct {
			Uuid string `json:"uuid"`
		}

		resp, err := globalClient.R().
			SetSuccessResult(&result). // Read uuid response into struct.
			Get("https://httpbin.org/uuid")

		if err != nil {
			return err
		}

		if resp.IsSuccessState() { // Print uuid returned by the API.
			fmt.Println(result.Uuid)
		} else {
			fmt.Println("bad response")
		}
		return nil
	},
}

func init() {
	uuidCmd.PersistentFlags().BoolVar(&enableDebug, "debug", os.Getenv("DEBUG") == "true", "Enable debug mode")
}

func main() {
	if err := uuidCmd.Execute(); err != nil {
		log.Fatalln(err)
	}
}
```

我们来编译并看下 `--help`:

```bash
$ go build -o uuid
$ ./uuid --help
Usage:
  uuid [flags]

Flags:
      --debug   Enable debug mode
  -h, --help    help for uuid
```

正常运行一下:

```bash
$ ./uuid
d576aaa4-56ad-4095-8929-97e2ee7fbb5d
```

通过命令行标志 `--debug=true` 开启 Debug:

```bash
$ ./uuid --debug
2022/05/25 10:00:33.093949 DEBUG [req] HTTP/2 GET https://httpbin.org/uuid
:authority: httpbin.org
:method: GET
:path: /uuid
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 200
date: Wed, 25 May 2022 02:00:33 GMT
content-type: application/json
content-length: 53
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

{
  "uuid": "d4ea37b6-455d-4ad4-a3ad-251fa606560a"
}

d4ea37b6-455d-4ad4-a3ad-251fa606560a
```

通过环境变量 `DEBUG=true` 开启 Debug:

```bash
$ DEBUG=true ./uuid
2022/05/25 10:13:59.303260 DEBUG [req] HTTP/2 GET https://httpbin.org/uuid
:authority: httpbin.org
:method: GET
:path: /uuid
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 200
date: Wed, 25 May 2022 02:13:59 GMT
content-type: application/json
content-length: 53
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

{
  "uuid": "52ab1a27-a777-4d77-8eb5-81f7c0d9f694"
}

52ab1a27-a777-4d77-8eb5-81f7c0d9f694
```

## Go Flag 示例

使用 go 标准库的 `flag` 包创建 golang 命令行工具，通过全局 `--debug=true` 标志或 `DEBUG=true` 环境变量开启 Debug 模式：

```go
package main

import (
	"flag"
	"fmt"
	"github.com/imroc/req/v3"
	"os"
)

var globalClient = req.C()

var enableDebug bool

func init() {
	flag.BoolVar(&enableDebug, "debug", os.Getenv("DEBUG") == "true", "Enable debug mode")
}

func main() {
	flag.Parse()
	if enableDebug { // Enable debug mode if `--enableDebug=true` or `DEBUG=true`.
		globalClient.EnableDumpAll()  // Dump all requests.
		globalClient.EnableDebugLog() // Output debug log.
	}
	var result struct {
		Uuid string `json:"uuid"`
	}

	resp, err := globalClient.R().
		SetSuccessResult(&result). // Read uuid response into struct.
		Get("https://httpbin.org/uuid")

	if err != nil {
		panic(err)
	}

	if resp.IsSuccessState() { // Print uuid returned by the API.
		fmt.Println(result.Uuid)
	} else {
		fmt.Println("bad response")
	}
}
```

我们来编译并看下 `--help`:

```bash
$ go build -o uuid
$ ./uuid --help
Usage of ./uuid:
  -debug
        Enable debug mode
```

Run it normally:

```bash
$ ./uuid
eff1eb30-09ae-4b40-9b48-1d0f82c46c5f
```

通过命令行标志 `--debug=true` 开启 Debug:

```bash
$ ./uuid --debug=true
2022/05/25 10:27:20.447394 DEBUG [req] HTTP/2 GET https://httpbin.org/uuid
:authority: httpbin.org
:method: GET
:path: /uuid
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 200
date: Wed, 25 May 2022 02:27:20 GMT
content-type: application/json
content-length: 53
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

{
  "uuid": "1521e76f-0345-4aa4-8a65-1895a5703e7d"
}

1521e76f-0345-4aa4-8a65-1895a5703e7d
```

通过环境变量 `DEBUG=true` 开启 Debug:

```bash
$ DEBUG=true ./uuid
2022/05/25 10:27:25.661215 DEBUG [req] HTTP/2 GET https://httpbin.org/uuid
:authority: httpbin.org
:method: GET
:path: /uuid
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 200
date: Wed, 25 May 2022 02:27:25 GMT
content-type: application/json
content-length: 53
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

{
  "uuid": "020e05c4-8f39-424f-9284-a4706a15ed8c"
}

020e05c4-8f39-424f-9284-a4706a15ed8c
```

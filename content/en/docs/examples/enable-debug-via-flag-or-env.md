---
title: "Enable Debug via Flag or Env"
description: "This article will introduce how to enable debug with flag or environment variable"
lead: ""
draft: false
images: []
weight: 1000
menu:
  docs:
    parent: "examples"
toc: true
---

## Cobra Example

Use `cobra` to create a golang command line tool, enabling debug mode with global `--debug=true` flag or `DEBUG=true` environment variable:

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
			SetResult(&result). // Read uuid response into struct.
			Get("https://httpbin.org/uuid")

		if err != nil {
			return err
		}

		if resp.IsSuccess() { // Print uuid returned by the API.
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

Let's build and take a look at the `--help`:

```bash
$ go build -o uuid
$ ./uuid --help
Usage:
  uuid [flags]

Flags:
      --debug   Enable debug mode
  -h, --help    help for uuid
```

Run it normally:

```bash
$ ./uuid
d576aaa4-56ad-4095-8929-97e2ee7fbb5d
```

Enable debug mode with flag `--debug=true`:

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

Enable debug mode with environment variable `DEBUG=true`:

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

## Go Flag Example

Use the `flag` package of the go standard library to create a golang command line tool, enabling debug mode with global `--debug=true` flag or `DEBUG=true` environment variable:

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
		SetResult(&result). // Read uuid response into struct.
		Get("https://httpbin.org/uuid")

	if err != nil {
		panic(err)
	}

	if resp.IsSuccess() { // Print uuid returned by the API.
		fmt.Println(result.Uuid)
	} else {
		fmt.Println("bad response")
	}
}
```

Let's build and take a look at the `--help`:

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

Enable debug mode with flag `--debug=true`:

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

Enable debug mode with environment variable `DEBUG=true`:

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

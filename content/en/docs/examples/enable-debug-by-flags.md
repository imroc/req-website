---
title: "Enable Debug by Flags"
description: ""
lead: ""
draft: false
images: []
weight: 20
menu:
  docs:
    parent: "examples"
toc: true
---

## Cobra Example

Use `cobra` to create a golang command line tool, enable debug mode with global `--debug` flag:

```txt
package main

import (
	"fmt"
	"github.com/imroc/req/v3"
	"github.com/spf13/cobra"
	"log"
)

type GlobalArgs struct {
	Debug bool
}

var globalArgs *GlobalArgs

var client = req.C()

type UUID struct {
	Uuid string `json:"uuid"`
}

var rootCmd = cobra.Command{
	Use: "uuid",
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		if globalArgs.Debug { // Enable debug mode if `--debug=true`.
			client.EnableDumpAll()
			client.EnableDebugLog()
		}
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		var uuid UUID

		resp, err := client.R().
			SetResult(&uuid). // Read uuid response into struct.
			Get("https://httpbin.org/uuid")

		if err != nil {
			return err
		}

		if resp.IsSuccess() { // Print uuid returned by the API.
			fmt.Println(uuid.Uuid)
		} else {
			fmt.Println("bad response")
		}
		return nil
	},
}

func init() {
	globalArgs = &GlobalArgs{}
	rootCmd.PersistentFlags().BoolVar(&globalArgs.Debug, "debug", false, "Enable debug mode")
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		log.Fatalln(err)
	}
}

```

Let's look at the execution output:

```bash
$ ./uuid
715ca300-cb7b-43cb-882e-2221e7079d25
$ ./uuid --debug
2022/05/24 21:25:19.862225 DEBUG [req] HTTP/2 GET https://httpbin.org/uuid
:authority: httpbin.org
:method: GET
:path: /uuid
:scheme: https
accept-encoding: gzip
user-agent: req/v3 (https://github.com/imroc/req)

:status: 200
date: Tue, 24 May 2022 13:25:20 GMT
content-type: application/json
content-length: 53
server: gunicorn/19.9.0
access-control-allow-origin: *
access-control-allow-credentials: true

{
  "uuid": "b4408800-0b94-42ea-9bd3-7ed3b1cdb918"
}

b4408800-0b94-42ea-9bd3-7ed3b1cdb918

```

---
title: "Introduction"
description: "Doks is a Hugo theme for building secure, fast, and SEO-ready documentation websites, which you can easily update and customize."
lead: "Req is a Simple Go HTTP client with Black Magic, write less code with more efficiency."
draft: false
images: []
weight: 100
menu:
  docs:
    parent: "prologue"
toc: true
---

## Features

* Simple and chainable methods for both client-level and request-level settings, and the request-level setting takes precedence if both are set.
* Powerful and convenient debug utilities, including debug logs, performance traces, and even dump the complete request and response content (see [Debugging - Dump/Log/Trace](../../tutorial/debugging/)).
* Easy making HTTP test with code instead of tools like curl or postman, req provide global wrapper methods and MustXXX to test  API with minimal code (see [Quick HTTP Test](../../tutorial/quick-test/)).
* Works fine with both HTTP/2 and HTTP/1.1, which HTTP/2 is preferred by default if server support, and you can also force HTTP/1.1 if you want (see [Force HTTP version](../../tutorial/force-http-version/)).
* Detect the charset of response body and decode it to utf-8 automatically to avoid garbled characters by default (see [Auto Decode](../../tutorial/auto-decode/)).
* Automatic marshal and unmarshal for JSON and XML content type and fully customizable (see [Marshal and Unmarshal](../../tutorial/marshal-unmarshal/)).
* Exportable Transport, easy to integrate with existing http.Client, debug APIs with minimal code change.
* Easy [Download](../../tutorial/download/) and [Upload](../../tutorial/upload/).
* Easy set header, cookie, path parameter, query parameter, form data, basic auth, bearer token for both client and request level.
* Easy set timeout, proxy, certs, redirect policy, cookie jar, compression, keepalive etc for client.
* Support middleware before request sent and after got response (see [Request and Response Middleware](../../tutorial/middleware/)).


## License

`Req` released under MIT license, refer [LICENSE](https://github.com/imroc/req/blob/master/LICENSE) file.

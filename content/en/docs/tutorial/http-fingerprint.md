---
title: "HTTP Fingerprint"
description: "Describes how to impersonates HTTP fingerprint"
draft: false
images: []
weight: 605
menu:
  docs:
    parent: "tutorial"
toc: true
---

## What is an HTTP fingerprinting?

Different implementations of HTTP clients have some differences and distinct features when interacting with a server. These characteristics are referred to as HTTP fingerprints. Some websites may use HTTP fingerprint detection to identify client types and respond with different content based on the client, commonly used for anti-web scraping purposes (anti-crawler). They may allow access only to normal browsers while denying access to web scraping programs.

How can we make our programs fetch content from websites that employ anti-crawler techniques? The solution lies in disguising ourselves as a regular browser by simulating the characteristics of a browser in our HTTP requests (faking the HTTP fingerprint). By tricking the server's fingerprint checks, we can obtain content just like a regular browser.

## How to impersonate HTTP fingerprint?

How can we fake the HTTP fingerprint of our client to deceive the server?

An HTTP fingerprint is made up of a series of features. The more detailed the server's checks are (higher anti-crawler), the more difficult it is to fake the fingerprint. Of course, if we impersonate all the features, we can successfully deceive the server.

Some common features include:
1. The value of the User-Agent header.
2. Headers and their arrangement order.
3. TLS fingerprint, which includes the features sent by the client during the TLS handshake, such as the supported cipher suites and their arrangement order, supported TLS versions, compression methods, TLS extensions, etc.

For HTTP2, there are additional features that can be checked:
1. Values and arrangement order of HTTP2 settings frame.
2. Values of HTTP2 `WINDOW_UPDATE` frame.
3. List and arrangement order of HTTP2 Priority frames.
4. The order of Pseudo-Headers.
5. Request headers and their arrangement order, as well as the values of flags and priority options in the header frame.

## Impersonate HTTP fingerprints with req

Most of the features cannot be impersonated using the standard `net/http` library, but it can be achieved effortlessly using the `req` library. For example, if you want to impersonate Chrome browser for making a request, you can directly call the `ImpersonateChrome()` method of the Client:

```go
client. ImpersonateChrome()
```

Similarly, to impersonate Firefox:

```go
client. ImpersonateFirefox()
```

## How to Verify HTTP Fingerprint?

Some websites offer free capabilities to verify HTTP fingerprints, such as: https://tls.peet.ws/api/all

Here is an example of using req to view the fingerprint information for the current request:

```go
package main

import (
	"github.com/imroc/req/v3"
)

func main() {
	client := req.DevMode()
	client.ImpersonateChrome()
	client.R().MustGet("https://tls.peet.ws/api/all")
}
```

## Want more HTTP fingerprint?

If you want to customize HTTP fingerprints and support more types of HTTP fingerprint, you can refer to existing implementations like `Client.ImpersonateFirefox()`.

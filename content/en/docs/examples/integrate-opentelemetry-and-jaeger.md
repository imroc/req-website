---
title: "Integrate with OpenTelemetry and Jaeger"
description: "This article will introduce how to integrate req with OpenTelemetry and Jaeger"
lead: ""
draft: false
images: []
weight: 1100
menu:
  docs:
    parent: "examples"
toc: true
---

## Overview

In order to enhance the observability of Golang programs and help troubleshoot problems, we often integrate our code with the tracing framework. [Jaeger](https://www.jaegertracing.io/) is a more mainstream choice today, and tracing-related APIs are now abstracted into the [OpenTelemetry](https://opentelemetry.io/docs/instrumentation/go/getting-started/) project, covering various implementations, including Jaeger.

Using req's powerful middleware capabilities, we can easily integrate unified tracing capabilities for all http requests, and can be extended with a minimal code change.

This article will give an example of a runnable program: enter a GitHub username, display a brief introduction to the user, including the name, website, and the most popular open source projects under the user and the corresponding number of stars, the tracing information is reported to Jaeger for visual display.

Mainly include the following features:

* Built-in a GitHub SDK based on req.
* The `RequestMiddleware` and `ResponseMiddleware` of req are used in the SDK to uniformly handle API exceptions, and the implementation functions of the API call do not need to care about error handling.
* The SDK supports pass in a OpenTelemetry tracer to enable tracing, uses the client middleware capability of req to create a trace span before the request, and records the detailed information of the request and response into the span (URL, Method, request header, request body, response status code, response header, response body, etc.), and automatically end the span after the response ends.
* Trace is also used outside the SDK, and the trace context is passed layer by layer. You can view the complete and very detailed tracing information on the Jaeger UI.

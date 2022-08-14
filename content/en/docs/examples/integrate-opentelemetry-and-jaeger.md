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

## Init the Project

First create a directory and initialize the project with `go mod init`:

```bash
go mod init opentelemetry-jaeger-tracing
```

## Build a GitHub SDK that supports Tracing

Create a directory named `github` under the project root directory as the package of the built-in GitHub SDK, create the source file `github.go` in it, and write the code:

```go
package github

import (
  "context"
  "fmt"
  "github.com/imroc/req/v3"
  "go.opentelemetry.io/otel/attribute"
  "go.opentelemetry.io/otel/codes"
  "go.opentelemetry.io/otel/trace"
  "strconv"
  "strings"
)

// Client is the go client for GitHub API.
type Client struct {
  *req.Client
}

// APIError represents the error message that GitHub API returns.
// GitHub API doc: https://docs.github.com/en/rest/overview/resources-in-the-rest-api#client-errors
type APIError struct {
  Message          string `json:"message"`
  DocumentationUrl string `json:"documentation_url,omitempty"`
  Errors           []struct {
    Resource string `json:"resource"`
    Field    string `json:"field"`
    Code     string `json:"code"`
  } `json:"errors,omitempty"`
}

// Error convert APIError to a human readable error and return.
func (e *APIError) Error() string {
  msg := fmt.Sprintf("API error: %s", e.Message)
  if e.DocumentationUrl != "" {
    return fmt.Sprintf("%s (see doc %s)", msg, e.DocumentationUrl)
  }
  if len(e.Errors) == 0 {
    return msg
  }
  errs := []string{}
  for _, err := range e.Errors {
    errs = append(errs, fmt.Sprintf("resource:%s field:%s code:%s", err.Resource, err.Field, err.Code))
  }
  return fmt.Sprintf("%s (%s)", msg, strings.Join(errs, " | "))
}

// NewClient create a GitHub client.
func NewClient() *Client {
  c := req.C().
    // All GitHub API requests need this header.
    SetCommonHeader("Accept", "application/vnd.github.v3+json").
    // All GitHub API requests use the same base URL.
    SetBaseURL("https://api.github.com").
    // EnableDump at the request level in request middleware which dump content into
    // memory (not print to stdout), we can record dump content only when unexpected
    // exception occurs, it is helpful to troubleshoot problems in production.
    OnBeforeRequest(func(c *req.Client, r *req.Request) error {
      if r.RetryAttempt > 0 { // Ignore on retry, no need to repeat EnableDump.
        return nil
      }
      r.EnableDump()
      return nil
    }).
    // Unmarshal response body into an APIError struct when status >= 400.
    SetCommonError(&APIError{}).
    // Handle common exceptions in response middleware.
    OnAfterResponse(func(client *req.Client, resp *req.Response) error {
      if resp.Err != nil { // There is an underlying error, e.g. network error or unmarshal error(SetResult or SetError was invoked before).
        if dump := resp.Dump(); dump != "" { // Append dump content to original underlying error to help troubleshoot.
          resp.Err = fmt.Errorf("%s\nraw content:\n%s", resp.Err.Error(), resp.Dump())
        }
        return nil // Skip the following logic if there is an underlying error.
      }
      if err, ok := resp.Error().(*APIError); ok { // Server returns an error message.
        // Convert it to human-readable go error.
        resp.Err = err
        return nil
      }
      // Corner case: neither an error response nor a success response,
      // dump content to help troubleshoot.
      if !resp.IsSuccess() {
        resp.Err = fmt.Errorf("bad response, raw content:\n%s", resp.Dump())
      }
      return nil
    })

  return &Client{
    Client: c,
  }
}
```

* Use the `Client` struct as the GitHub client, which is also the core struct of the SDK, with a built-in `*req.Client`.
* Use `SetCommonHeader` and `SetBaseURL` respectively to set a unified `Accept` request header and URL prefix for all GitHub API requests.
* The error format of the GitHub API response is unified. Use `SetCommonError` to tell req that if the response is an error (status code >= 400), the response body will be unmarshalled automatically to the object of the `APIError` struct.
* The `APIError` struct implements the go error interface, and converts the json API error message into a readable string.
* Set `ResponseMiddleware` in `OnAfterResponse`, when detecting an API response error, write it to `resp.Err`, and automatically throw it to the upper-layer caller as a go error.
* Set `RequestMiddleware` in `OnBeforeRequest` to enable request-level dump (temporarily stored in memory, not printed) for all requests, if you encounter underlying errors (such as timeout, dns failure, unmarshal failure), or receive an unknown status code (less than 200), in `ResponseMiddleware`, record the information (dump content) that is helpful for troubleshooting as much as possible to error, and write `resp.Err` to throw it to the upper caller.

Let's add tracing capabilities to `Client`:

```go
type apiNameType int

const apiNameKey apiNameType = iota

// SetTracer set the tracer of opentelemetry.
func (c *Client) SetTracer(tracer trace.Tracer) {
    c.WrapRoundTripFunc(func(rt req.RoundTripper) req.RoundTripFunc {
        return func(req *req.Request) (resp *req.Response, err error) {
            ctx := req.Context()
            apiName, ok := ctx.Value(apiNameKey).(string)
            if !ok {
                apiName = req.URL.Path
            }
            _, span := tracer.Start(req.Context(), apiName)
            defer span.End()
            span.SetAttributes(
                attribute.String("http.url", req.URL.String()),
                attribute.String("http.method", req.Method),
                attribute.String("http.req.header", req.HeaderToString()),
            )
            if len(req.Body) > 0 {
                span.SetAttributes(
                    attribute.String("http.req.body", string(req.Body)),
                )
            }
            resp, err = rt.RoundTrip(req)
            if err != nil {
                span.RecordError(err)
                span.SetStatus(codes.Error, err.Error())
            }
            if resp.Response != nil {
                span.SetAttributes(
                    attribute.Int("http.status_code", resp.StatusCode),
                    attribute.String("http.resp.header", resp.HeaderToString()),
                    attribute.String("http.resp.body", resp.String()),
                )
            }
            return
        }
    })
}
```

TODO: translation

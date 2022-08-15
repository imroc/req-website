---
title: "Client Settings"
description: "API for Client Settings"
draft: false
images: []
weight: 10000
menu:
  docs:
    parent: "ref"
toc: true
---

The following are the chainable settings of Client, all of which have corresponding global wrappers (Just treat the package name `req` as a Client to test, set up the Client without create any Client explicitly).

Basically, you can know the meaning of most settings directly from the method name.

## Debug Features

* [DevMode()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DevMode) - Enable all debug features (Dump, DebugLog and Trace).
* [EnableDebugLog()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDebugLog) - Enable debug level log (disabled by default).
* [DisableDebugLog()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableDebugLog)
* [SetLogger(log Logger)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetLogger) - Set the customized logger.
* [EnableDumpAll()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpAll) - Enable dump for all requests.
* [DisableDumpAll()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableDumpAll)
* [SetCommonDumpOptions(opt *DumpOptions)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonDumpOptions)
* [EnableDumpAllAsync()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpAllAsync)
* [EnableDumpAllTo(output io.Writer)](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpAllTo)
* [EnableDumpAllToFile(filename string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpAllToFile)
* [EnableDumpAllWithoutBody()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpAllWithoutBody)
* [EnableDumpAllWithoutHeader()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpAllWithoutHeader)
* [EnableDumpAllWithoutRequest()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpAllWithoutRequest)
* [EnableDumpAllWithoutRequestBody()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpAllWithoutRequestBody)
* [EnableDumpAllWithoutResponse()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpAllWithoutResponse)
* [EnableDumpAllWithoutResponseBody()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpAllWithoutResponseBody)
* [EnableTraceAll()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableTraceAll) - Enable trace for all requests (disabled by default).
* [DisableTraceAll()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableTraceAll)

## Common Settings for constructing HTTP Requests

* [SetCommonBasicAuth(username, password string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonBasicAuth)
* [SetCommonBearerAuthToken(token string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonBearerAuthToken)
* [SetCommonContentType(ct string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonContentType)
* [SetCommonCookies(cookies ...*http.Cookie)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonCookies)
* [SetCommonFormData(data map[string]string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonFormData)
* [SetCommonFormDataFromValues(data url.Values)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonFormDataFromValues)
* [SetCommonHeader(key, value string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonHeader)
* [SetCommonHeaders(hdrs map[string]string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonHeaders)
* [SetCommonPathParam(key, value string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonPathParam)
* [SetCommonPathParams(pathParams map[string]string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonPathParams)
* [SetCommonQueryParam(key, value string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonQueryParam)
* [SetCommonQueryParams(params map[string]string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonQueryParams)
* [SetCommonQueryString(query string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonQueryString)
* [AddCommonQueryParam(key, value string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.AddCommonQueryParam)
* [SetUserAgent(userAgent string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetUserAgent)

## Auto-Decode

* [EnableAutoDecode()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableAutoDecode)
* [DisableAutoDecode()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableAutoDecode) - Disable auto-detect charset and decode to utf-8 (enabled by default).
* [SetAutoDecodeContentType(contentTypes ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetAutoDecodeContentType)
* [SetAutoDecodeAllContentType()](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetAutoDecodeAllContentType)
* [SetAutoDecodeContentTypeFunc(fn func(contentType string) bool)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetAutoDecodeContentTypeFunc)

## TLS and Certificates

* [SetCerts(certs ...tls.Certificate) ](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCerts)
* [SetCertFromFile(certFile, keyFile string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCertFromFile)
* [SetRootCertsFromFile(pemFiles ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetRootCertsFromFile)
* [SetRootCertFromString(pemContent string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetRootCertFromString)
* [EnableInsecureSkipVerify()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableInsecureSkipVerify) - Disabled by default.
* [DisableInsecureSkipVerify](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableInsecureSkipVerify)
* [SetTLSHandshakeTimeout(timeout time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetTLSHandshakeTimeout)
* [SetTLSClientConfig(conf *tls.Config)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetTLSClientConfig)

## Marshal&Unmarshal

* [SetJsonUnmarshal(fn func(data []byte, v interface{}) error)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetJsonUnmarshal)
* [SetJsonMarshal(fn func(v interface{}) ([]byte, error))](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetJsonMarshal)
* [SetXmlUnmarshal(fn func(data []byte, v interface{}) error)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetXmlUnmarshal)
* [SetXmlMarshal(fn func(v interface{}) ([]byte, error))](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetXmlMarshal)

## Middleware

* [OnBeforeRequest(m RequestMiddleware)](https://pkg.go.dev/github.com/imroc/req/v3#Client.OnBeforeRequest)
* [OnAfterResponse(m ResponseMiddleware)](https://pkg.go.dev/github.com/imroc/req/v3#Client.OnAfterResponse)

## HTTP Version

* [DisableForceHttpVersion()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableForceHttpVersion)
* [EnableForceHTTP3()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableForceHTTP3)
* [EnableForceHTTP2()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableForceHTTP2)
* [EnableForceHTTP1()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableForceHTTP1)

## Retry

* [SetCommonRetryCount(count int)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonRetryCount)
* [SetCommonRetryInterval(getRetryIntervalFunc GetRetryIntervalFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonRetryInterval)
* [SetCommonRetryFixedInterval(interval time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonRetryFixedInterval)
* [SetCommonRetryBackoffInterval(min, max time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonRetryBackoffInterval)
* [SetCommonRetryHook(hook RetryHookFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonRetryHook)
* [AddCommonRetryHook(hook RetryHookFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Client.AddCommonRetryHook)
* [SetCommonRetryCondition(condition RetryConditionFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonRetryCondition)
* [AddCommonRetryCondition(condition RetryConditionFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Client.AddCommonRetryCondition)

## Middleware

* [WrapRoundTripFunc(funcs ...RoundTripWrapperFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Client.WrapRoundTripFunc)
* [WrapRoundTrip(wrappers ...RoundTripWrapper)](https://pkg.go.dev/github.com/imroc/req/v3#Client.WrapRoundTrip)
* [OnBeforeRequest(m RequestMiddleware)](https://pkg.go.dev/github.com/imroc/req/v3#Client.OnBeforeRequest)
* [OnAfterResponse(m ResponseMiddleware)](https://pkg.go.dev/github.com/imroc/req/v3#Client.OnAfterResponse)

## Other Settings

* [SetTimeout(d time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetTimeout)
* [EnableKeepAlives()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableKeepAlives)
* [DisableKeepAlives()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableKeepAlives) - Enabled by default.
* [SetScheme(scheme string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetScheme)
* [SetBaseURL(u string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetBaseURL)
* [SetProxyURL(proxyUrl string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetProxyURL)
* [SetProxy(proxy func(*http.Request) (*urlpkg.URL, error))](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetProxy)
* [SetOutputDirectory(dir string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetOutputDirectory)
* [SetDialTLS(fn func(ctx context.Context, network, addr string) (net.Conn, error))](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetDialTLS)
* [SetDial(fn func(ctx context.Context, network, addr string) (net.Conn, error))](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetDial)
* [SetCookieJar(jar http.CookieJar)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCookieJar)
* [SetRedirectPolicy(policies ...RedirectPolicy)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetRedirectPolicy)
* [EnableCompression()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableCompression)
* [DisableCompression()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableCompression) - Enabled by default
* [EnableAutoReadResponse()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableAutoReadResponse)
* [DisableAutoReadResponse()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableAutoReadResponse) - Enabled by default
* [EnableAllowGetMethodPayload()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableAllowGetMethodPayload) - Disabled by default.
* [DisableAllowGetMethodPayload()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableAllowGetMethodPayload)
* [SetUnixSocket(file string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetUnixSocket)


---
title: "Client"
description: "Client 的 API 汇总"
draft: false
images: []
weight: 10000
menu:
  docs:
    parent: "ref"
toc: true
---

## 创建请求

`Client` 的以下这些方法会创建 HTTP 请求。

* [R()](https://pkg.go.dev/github.com/imroc/req/v3#Client.R)
* [NewRequest()](https://pkg.go.dev/github.com/imroc/req/v3#Client.NewRequest) - R 的别名.
* [Get(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Get) - 创建 GET 请求，URL 是可选的。
* [Post(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Post)
* [Head(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Head)
* [Delete(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Delete)
* [Put(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Put)
* [Patch(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Patch)
* [Options(url ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.Options)

## Client 设置

以下是 `Client` 设置相关的方法，它们都有对应的全局包装方法(测试时不需要显式创建 `Client`，直接调用全局同名方法)，基本上可以从方法命名就能直接看出设置的含义。

### Debug 能力

* [DevMode()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DevMode) - 启用所有 Debug 特性 (Dump, DebugLog 和 Trace)
* [EnableDebugLog()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDebugLog) - 启用 Debug 级别日志 (默认是关闭)
* [DisableDebugLog()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableDebugLog)
* [SetLogger(log Logger)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetLogger) - 自定义 Logger
* [EnableTraceAll()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableTraceAll) - 为所有请求开启 Trace (默认是关闭)
* [DisableTraceAll()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableTraceAll)
* [EnableDumpAll()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpAll) - dump 所有请求 (默认是关闭)
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
* [EnableDumpEeachRequest()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpEeachRequest) - 语法糖，利用 Request 中间件为每个请求单独开启 dump(不打印)，在需要的时候获取 dump 内容 (默认是关闭)
* [EnableDumpEeachRequestWithoutBody()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpEeachRequestWithoutBody)
* [EnableDumpEeachRequestWithoutHeader()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpEeachRequestWithoutHeader)
* [EnableDumpEeachRequestWithoutResponse()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpEeachRequestWithoutResponse)
* [EnableDumpEeachRequestWithoutRequest()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpEeachRequestWithoutRequest)
* [EnableDumpEeachRequestWithoutRequestBody()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpEeachRequestWithoutRequestBody)
* [EnableDumpEeachRequestWithoutResponseBody()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableDumpEeachRequestWithoutResponseBody)

### 构造请求的共同设置

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

### 自动解码

* [EnableAutoDecode()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableAutoDecode) - 默认就是启用，自动探测字符集并解码到 utf-8
* [DisableAutoDecode()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableAutoDecode)
* [SetAutoDecodeContentType(contentTypes ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetAutoDecodeContentType)
* [SetAutoDecodeAllContentType()](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetAutoDecodeAllContentType)
* [SetAutoDecodeContentTypeFunc(fn func(contentType string) bool)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetAutoDecodeContentTypeFunc)

### TLS 和证书

* [SetCerts(certs ...tls.Certificate) ](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCerts)
* [SetCertFromFile(certFile, keyFile string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCertFromFile)
* [SetRootCertsFromFile(pemFiles ...string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetRootCertsFromFile)
* [SetRootCertFromString(pemContent string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetRootCertFromString)
* [EnableInsecureSkipVerify()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableInsecureSkipVerify)
* [DisableInsecureSkipVerify](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableInsecureSkipVerify) - 默认就是关闭
* [SetTLSHandshakeTimeout(timeout time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetTLSHandshakeTimeout)
* [SetTLSClientConfig(conf *tls.Config)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetTLSClientConfig)

### Marshal 和 Unmarshal

* [SetJsonUnmarshal(fn func(data []byte, v interface{}) error)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetJsonUnmarshal)
* [SetJsonMarshal(fn func(v interface{}) ([]byte, error))](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetJsonMarshal)
* [SetXmlUnmarshal(fn func(data []byte, v interface{}) error)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetXmlUnmarshal)
* [SetXmlMarshal(fn func(v interface{}) ([]byte, error))](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetXmlMarshal)

### 中间件

* [OnBeforeRequest(m RequestMiddleware)](https://pkg.go.dev/github.com/imroc/req/v3#Client.OnBeforeRequest)
* [OnAfterResponse(m ResponseMiddleware)](https://pkg.go.dev/github.com/imroc/req/v3#Client.OnAfterResponse)

### HTTP 版本

* [DisableForceHttpVersion()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableForceHttpVersion)
* [EnableForceHTTP3()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableForceHTTP3)
* [DisableHTTP3()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableHTTP3)
* [EnableForceHTTP2()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableForceHTTP2)
* [EnableForceHTTP1()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableForceHTTP1)

### 自动重试

* [SetCommonRetryCount(count int)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonRetryCount)
* [SetCommonRetryInterval(getRetryIntervalFunc GetRetryIntervalFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonRetryInterval)
* [SetCommonRetryFixedInterval(interval time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonRetryFixedInterval)
* [SetCommonRetryBackoffInterval(min, max time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonRetryBackoffInterval)
* [SetCommonRetryHook(hook RetryHookFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonRetryHook)
* [AddCommonRetryHook(hook RetryHookFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Client.AddCommonRetryHook)
* [SetCommonRetryCondition(condition RetryConditionFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCommonRetryCondition)
* [AddCommonRetryCondition(condition RetryConditionFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Client.AddCommonRetryCondition)

### 中间件

* [WrapRoundTripFunc(funcs ...RoundTripWrapperFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Client.WrapRoundTripFunc) - Client 中间件
* [WrapRoundTrip(wrappers ...RoundTripWrapper)](https://pkg.go.dev/github.com/imroc/req/v3#Client.WrapRoundTrip) - Client 中间件
* [OnBeforeRequest(m RequestMiddleware)](https://pkg.go.dev/github.com/imroc/req/v3#Client.OnBeforeRequest) - Request 中间件
* [OnAfterResponse(m ResponseMiddleware)](https://pkg.go.dev/github.com/imroc/req/v3#Client.OnAfterResponse) - Response 中间件

### 网络、代理和 URL

* [SetTimeout(d time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetTimeout)
* [SetDialTLS(fn func(ctx context.Context, network, addr string) (net.Conn, error))](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetDialTLS)
* [SetDial(fn func(ctx context.Context, network, addr string) (net.Conn, error))](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetDial)
* [SetProxyURL(proxyUrl string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetProxyURL)
* [SetProxy(proxy func(*http.Request) (*urlpkg.URL, error))](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetProxy)
* [SetUnixSocket(file string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetUnixSocket)
* [SetScheme(scheme string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetScheme)
* [SetBaseURL(u string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetBaseURL)

### Keepalive、 Cookie、 压缩和重定向策略

* [EnableKeepAlives()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableKeepAlives) - 默认就是启用
* [DisableKeepAlives()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableKeepAlives)
* [SetCookieJar(jar http.CookieJar)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetCookieJar)
* [ClearCookies()](https://pkg.go.dev/github.com/imroc/req/v3#Client.ClearCookies)
* [SetRedirectPolicy(policies ...RedirectPolicy)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetRedirectPolicy)
* [EnableCompression()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableCompression) - 默认就是启用
* [DisableCompression()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableCompression)

### 下载、自动读 Response 和允许 GET 请求带 Body

* [SetOutputDirectory(dir string)](https://pkg.go.dev/github.com/imroc/req/v3#Client.SetOutputDirectory)
* [EnableAutoReadResponse()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableAutoReadResponse) - 默认就是启用
* [DisableAutoReadResponse()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableAutoReadResponse)
* [EnableAllowGetMethodPayload()](https://pkg.go.dev/github.com/imroc/req/v3#Client.EnableAllowGetMethodPayload) - 默认就是启用
* [DisableAllowGetMethodPayload()](https://pkg.go.dev/github.com/imroc/req/v3#Client.DisableAllowGetMethodPayload)

## 其它方法

* [GetTransport()](https://pkg.go.dev/github.com/imroc/req/v3#Client.GetTransport)
* [Clone()](https://pkg.go.dev/github.com/imroc/req/v3#Client.Clone)

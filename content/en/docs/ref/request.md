---
title: "Request"
description: "API for Request"
draft: false
images: []
weight: 10010
menu:
  docs:
    parent: "ref"
toc: true
---

## Send Request

These methods of `Request` will fire the http request and return the response, `MustXXX` will not return any error, panic if error occurs.

* [Get(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Get)
* [Head(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Head)
* [Post(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Post)
* [Delete(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Delete)
* [Patch(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Patch)
* [Options(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Options)
* [Put(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Put)
* [MustGet(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.MustGet)
* [MustHead(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.MustHead)
* [MustPost(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.MustPost)
* [MustDelete(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.MustDelete)
* [MustPatch(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.MustPatch)
* [MustOptions(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.MustOptions)
* [MustPut(url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.MustPut)
* [Send(method, url string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Put) - Send request with given method name and url.
* [Do(ctx ...context.Context)](https://pkg.go.dev/github.com/imroc/req/v3#Request.Do) - Send request with an optional context.

## Request Settings

The following are the chainable settings of Request, all of which have corresponding global wrappers.

Basically, you can know the meaning of most settings directly from the method name.

### URL Query and Path Parameter

* [AddQueryParam(key, value string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.AddQueryParam)
* [SetQueryParam(key, value string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetQueryParam)
* [SetQueryParams(params map[string]string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetQueryParams)
* [SetQueryParamsAnyType(params map[string]interface{})](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetQueryParamsAnyType)
* [SetQueryString(query string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetQueryString)
* [SetPathParam(key, value string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetPathParam)
* [SetPathParams(params map[string]string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetPathParams)

### Header and Cookie

* [SetHeader(key, value string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetHeader)
* [SetHeaders(hdrs map[string]string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetHeaders)
* [SetBasicAuth(username, password string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetBasicAuth)
* [SetBearerAuthToken(token string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetBearerAuthToken)
* [SetContentType(contentType string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetContentType)
* [SetCookies(cookies ...*http.Cookie)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetCookies)

### Body and Marshal&Unmarshal

* [SetBody(body interface{})](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetBody)
* [SetBodyBytes(body []byte)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetBodyBytes)
* [SetBodyJsonBytes(body []byte)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetBodyJsonBytes)
* [SetBodyJsonMarshal(v interface{})](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetBodyJsonMarshal)
* [SetBodyJsonString(body string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetBodyJsonString)
* [SetBodyString(body string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetBodyString)
* [SetBodyXmlBytes(body []byte)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetBodyXmlBytes)
* [SetBodyXmlMarshal(v interface{})](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetBodyXmlMarshal)
* [SetBodyXmlString(body string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetBodyXmlString)
* [SetResult(result interface{})](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetResult)
* [SetError(error interface{})](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetError)

### Request Level Debug

* [EnableTrace()](https://pkg.go.dev/github.com/imroc/req/v3#Request.EnableTrace) - Disabled by default.
* [DisableTrace()](https://pkg.go.dev/github.com/imroc/req/v3#Request.DisableTrace)
* [EnableDump()](https://pkg.go.dev/github.com/imroc/req/v3#Request.EnableDump)
* [EnableDumpTo(output io.Writer)](https://pkg.go.dev/github.com/imroc/req/v3#Request.EnableDumpTo)
* [EnableDumpToFile(filename string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.EnableDumpToFile)
* [EnableDumpWithoutBody()](https://pkg.go.dev/github.com/imroc/req/v3#Request.EnableDumpWithoutBody)
* [EnableDumpWithoutHeader()](https://pkg.go.dev/github.com/imroc/req/v3#Request.EnableDumpWithoutHeader)
* [EnableDumpWithoutRequest()](https://pkg.go.dev/github.com/imroc/req/v3#Request.EnableDumpWithoutRequest)
* [EnableDumpWithoutRequestBody()](https://pkg.go.dev/github.com/imroc/req/v3#Request.EnableDumpWithoutRequestBody)
* [EnableDumpWithoutResponse()](https://pkg.go.dev/github.com/imroc/req/v3#Request.EnableDumpWithoutResponse)
* [EnableDumpWithoutResponseBody()](https://pkg.go.dev/github.com/imroc/req/v3#Request.EnableDumpWithoutResponseBody)
* [SetDumpOptions(opt *DumpOptions)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetDumpOptions)

### Multipart & Form & Upload

* [SetFormData(data map[string]string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFormData)
* [SetFormDataAnyType(data map[string]interface{})](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFormDataAnyType) - syntax sugar for SetFormData
* [SetFormDataFromValues(data url.Values)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFormDataFromValues)
* [SetFile(paramName, filePath string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFile)
* [SetFiles(files map[string]string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFiles)
* [SetFileBytes(paramName, filename string, content []byte)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFileBytes)
* [SetFileReader(paramName, filePath string, reader io.Reader)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFileReader)
* [SetFileUpload(uploads ...FileUpload)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFileUpload) - Set the fully custimized multipart file upload options.
* [SetUploadCallback(callback UploadCallback)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetUploadCallback)
* [SetUploadCallbackWithInterval(callback UploadCallback, minInterval time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetUploadCallbackWithInterval)

### Download

* [SetOutput(output io.Writer)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetOutput)
* [SetOutputFile(file string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetOutputFile)
* [SetDownloadCallback(callback DownloadCallback)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetDownloadCallback)
* [SetDownloadCallbackWithInterval(callback DownloadCallback, minInterval time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetDownloadCallbackWithInterval)

### Retry

* [SetRetryCount(count int)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetRetryCount)
* [SetRetryInterval(getRetryIntervalFunc GetRetryIntervalFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetRetryInterval)
* [SetRetryFixedInterval(interval time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetRetryFixedInterval)
* [SetRetryBackoffInterval(min, max time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetRetryBackoffInterval)
* [SetRetryHook(hook RetryHookFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetRetryHook)
* [AddRetryHook(hook RetryHookFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Request.AddRetryHook)
* [SetRetryCondition(condition RetryConditionFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetRetryCondition)
* [AddRetryCondition(condition RetryConditionFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Request.AddRetryCondition)

### Other Settings

* [SetContext(ctx context.Context)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetContext)


---
title: "Request 设置"
description: "Request 设置的 API 汇总"
draft: false
images: []
weight: 10010
menu:
  docs:
    parent: "ref"
toc: true
---

以下是 `Request` 设置相关的方法，它们都有对应的全局包装方法(测试时不需要显式创建 `Client` 和 `Request`，直接调用全局同名方法)，基本上可以从方法命名就能直接看出设置的含义。

## URL 查询参数和路径参数

* [AddQueryParam(key, value string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.AddQueryParam)
* [SetQueryParam(key, value string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetQueryParam)
* [SetQueryParams(params map[string]string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetQueryParams)
* [SetQueryString(query string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetQueryString)
* [SetPathParam(key, value string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetPathParam)
* [SetPathParams(params map[string]string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetPathParams)

## Header 和 Cookie

* [SetHeader(key, value string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetHeader)
* [SetHeaders(hdrs map[string]string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetHeaders)
* [SetBasicAuth(username, password string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetBasicAuth)
* [SetBearerAuthToken(token string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetBearerAuthToken)
* [SetContentType(contentType string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetContentType)
* [SetCookies(cookies ...*http.Cookie)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetCookies)

## Body 和 Marshal&Unmarshal

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

## 请求级别的 Debug

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

## Multipart & 表单 & 上传

* [SetFormData(data map[string]string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFormData)
* [SetFormDataFromValues(data url.Values)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFormDataFromValues)
* [SetFile(paramName, filePath string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFile)
* [SetFiles(files map[string]string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFiles)
* [SetFileBytes(paramName, filename string, content []byte)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFileBytes)
* [SetFileReader(paramName, filePath string, reader io.Reader)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFileReader)
* [SetFileUpload(uploads ...FileUpload)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetFileUpload) - Set the fully custimized multipart file upload options.
* [SetUploadCallback(callback UploadCallback)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetUploadCallback)
* [SetUploadCallbackWithInterval(callback UploadCallback, minInterval time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetUploadCallbackWithInterval)

## 下载

* [SetOutput(output io.Writer)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetOutput)
* [SetOutputFile(file string)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetOutputFile)
* [SetDownloadCallback(callback DownloadCallback)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetDownloadCallback)
* [SetDownloadCallbackWithInterval(callback DownloadCallback, minInterval time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetDownloadCallbackWithInterval)

## 自动重试

* [SetRetryCount(count int)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetRetryCount)
* [SetRetryInterval(getRetryIntervalFunc GetRetryIntervalFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetRetryInterval)
* [SetRetryFixedInterval(interval time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetRetryFixedInterval)
* [SetRetryBackoffInterval(min, max time.Duration)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetRetryBackoffInterval)
* [SetRetryHook(hook RetryHookFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetRetryHook)
* [AddRetryHook(hook RetryHookFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Request.AddRetryHook)
* [SetRetryCondition(condition RetryConditionFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetRetryCondition)
* [AddRetryCondition(condition RetryConditionFunc)](https://pkg.go.dev/github.com/imroc/req/v3#Request.AddRetryCondition)

## 其它设置

* [SetContext(ctx context.Context)](https://pkg.go.dev/github.com/imroc/req/v3#Request.SetContext)


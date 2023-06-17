---
title: "Retry"
description: "This article will introduce how to set retry."
draft: false
images: []
weight: 400
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Request Level

```go
client := req.C()

client.R().
    // Enable retry and set the maximum retry count.
    SetRetryCount(2).
    // Set the retry sleep interval with a commonly used algorithm: capped exponential backoff with jitter (https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/).
    SetRetryBackoffInterval(1 * time.Second, 5 * time.Second).
    // Set the retry to sleep fixed interval of 2 seconds.
    SetRetryFixedInterval(2 * time.Second).
    // Set the retry to use a custom retry interval algorithm.
    SetRetryInterval(func(resp *req.Response, attempt int) time.Duration {
        // Sleep seconds from "Retry-After" response header if it is present and correct.
        // https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html
        if resp.Response != nil {
            if ra := resp.Header.Get("Retry-After"); ra != "" {
                after, err := strconv.Atoi(ra)
                if err == nil {
                    return time.Duration(after) * time.Second
                }
            }
        }
        return 2 * time.Second // Otherwise, sleep 2 seconds
    }).
    // Add a retry hook that will be called if a retry occurs
    AddRetryHook(func(resp *req.Response, err error){
        req := resp.Request.RawRequest
        fmt.Println("Retry request:", req.Method, req.URL)
        // Modify request settings in the retry hook.
        resp.Request.SetBearerAuthToken(token)
    }).
    // Unlike add, set will remove all other retry hooks which is added before at both request and client level.
    SetRetryHook(hookFunc).
    // Add a retry condition which determines whether the request should retry.
    AddRetryCondition(func(resp *req.Response, err error) bool {
        return err != nil || resp.StatusCode >= 500
    })).
    // Unlike add, set will remove all other retry conditions which is added before at both request and client level.
    SetRetryCondition(conditionFunc1)
```

> If the retry condition is not set, `err != nil` is used by default. If set, it will override the default.

## Client Level

Similarly, you can set retry at the client level, which could be overridden at the client level:

```go
client.
    SetCommonRetryCount(2).
    SetCommonRetryBackoffInterval(1 * time.Second, 5 * time.Second).
    SetCommonRetryFixedInterval(2 * time.Second).
    SetCommonRetryInterval(intervalFunc).
    AddCommonRetryHook(hookFunc2).
    SetCommonRetryHook(hookFunc1).
    AddCommonRetryCondition(conditionFunc2).
    SetCommonRetryCondition(conditionFunc1)
```

## Examples

* [The crawler uses retry to automatically change the proxy to switch IP address](../../examples/easily-write-crawlers-with-req/#%E8%AF%B7%E6%B1%82%E5%A4%B1%E8%B4%A5%E8%87%AA%E5%8A%A8%E6%9B%B4%E6%8D%A2-ip-%E8%AE%BE%E7%BD%AE%E4%BB%A3%E7%90%86)

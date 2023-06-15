---
title: "TLS 指纹"
description: "介绍如何自定义 TLS 握手指纹"
draft: false
images: []
weight: 370
menu:
  docs:
    parent: "tutorial"
toc: true
---

有些网站会通过识别 TLS 握手指纹来禁止部分程序访问，golang tls 标准库的指纹很容易被识别，而 `req` 集成了 [utls](https://github.com/refraction-networking/utls)，可以模拟其它 TLS 指纹来绕过该限制，比如模拟 Chrome 浏览器的指纹：

```go
client := req.C().
	SetUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36").
	SetTLSFingerprintChrome() // 模拟 Chrome 浏览器的 TLS 握手指纹，让网站相信这是 Chrome 浏览器在访问，予以通行。

client.R().Get(url)
```

类似地，还有可以调用 Client 其它方法来模拟其它指纹，方法列表：

* `SetTLSFingerprintChrome`: 模拟 Chrome 浏览器指纹。
* `SetTLSFingerprintFirefox`: 模拟 Firefox 浏览器指纹。
* `SetTLSFingerprintEdge`: 模拟 Edge 浏览器指纹。
* `SetTLSFingerprintQQ`: 模拟 QQ 浏览器指纹。
* `SetTLSFingerprintSafari`: 模拟 Safari 浏览器指纹。
* `SetTLSFingerprint360`: 模拟 360 浏览器指纹。
* `SetTLSFingerprintIOS`: 模拟 IOS 指纹。
* `SetTLSFingerprintAndroid`: 模拟 Android 指纹。
* `SetTLSFingerprintRandomized`: 随机模拟指纹。

如果 server 对指纹的校验比较严格，你也可以尝试直接调用 `SetTLSFingerprint` 并传入 `utls` 的 `ClientHelloID` 来指定具体指纹版本。

如果还需更灵活的指纹自定义，你也可以尝试自己利用 `utls` 来构造握手函数并调用 `Client` 的 `SetTLSHandshake` 来自定义。

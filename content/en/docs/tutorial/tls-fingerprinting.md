---
title: "TLS Fingerprinting"
description: "Describes how to customize the TLS handshake fingerprint"
draft: false
images: []
weight: 370
menu:
  docs:
    parent: "tutorial"
toc: true
---

Some websites prohibit access to some programs by identifying TLS handshake fingerprints. The fingerprint of the golang tls standard library is easy to identify, and `req` integrates [utls](https://github.com/refraction-networking/utls), which can simulate other TLS fingerprints to bypass this restriction, such as emulating Chrome browser's fingerprint:

```go
client := req.C().
	SetUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36").
	SetTLSFingerprintChrome() // 模拟 Chrome 浏览器的 TLS 握手指纹，让网站相信这是 Chrome 浏览器在访问，予以通行。

client.R().Get(url)
```

Similarly, there are other methods of Client that can be called to simulate other fingerprints, the method list:

* `SetTLSFingerprintChrome`: Simulate Chrome browser fingerprinting.
* `SetTLSFingerprintFirefox`: Simulate Firefox browser fingerprinting.
* `SetTLSFingerprintEdge`: Simulate Edge browser fingerprinting.
* `SetTLSFingerprintQQ`: Simulate QQ browser fingerprinting.
* `SetTLSFingerprintSafari`: Simulate Safari browser fingerprinting.
* `SetTLSFingerprint360`: Simulate 360 browser fingerprinting.
* `SetTLSFingerprintIOS`: Simulate IOS fingerprinting.
* `SetTLSFingerprintAndroid`: Simulate Android fingerprinting.

If the server checks the fingerprint more strictly, you can also try calling `SetTLSFingerprint` directly and passing in the `ClientHelloID` of `utls` to specify the specific fingerprint version.

If you need more flexible fingerprint customization, you can also try to use `utls` to construct the handshake function and call `SetDialTLS` of `Client` to customize it.

**Note:** Currently when the tls fingerprint is set, the proxy will not take effect (if set).

---
title: "TLS Fingerprint"
description: "Describes how to customize the TLS handshake fingerprint"
draft: false
images: []
weight: 370
menu:
  docs:
    parent: "tutorial"
toc: true
---

Some websites prohibit access to some crawler programs by identifying TLS handshake fingerprints. The fingerprint of the golang tls standard library is easy to identify, and `req` integrates [utls](https://github.com/refraction-networking/utls), which can simulate other TLS fingerprints to bypass this restriction, such as emulating Chrome browser's fingerprint:

```go
client := req.C().
	SetUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36").
	SetTLSFingerprintChrome() // Simulate the TLS handshake fingerprint of the Chrome browser, so that the website believes that it is the Chrome browser that is accessing.

client.R().Get(url)
```

Similarly, there are other methods of Client that can be called to simulate other fingerprints, the method list:

* `SetTLSFingerprintChrome`: Simulate Chrome browser fingerprint.
* `SetTLSFingerprintFirefox`: Simulate Firefox browser fingerprint.
* `SetTLSFingerprintEdge`: Simulate Edge browser fingerprint.
* `SetTLSFingerprintQQ`: Simulate QQ browser fingerprint.
* `SetTLSFingerprintSafari`: Simulate Safari browser fingerprint.
* `SetTLSFingerprint360`: Simulate 360 browser fingerprint.
* `SetTLSFingerprintIOS`: Simulate IOS fingerprint.
* `SetTLSFingerprintAndroid`: Simulate Android fingerprint.
* `SetTLSFingerprintRandomized`: Simulate randomized fingerprint.

If the server checks the fingerprint more strictly, you can also try calling `SetTLSFingerprint` directly and passing in the `ClientHelloID` of `utls` to specify the specific fingerprint version.

If you need more flexible fingerprint customization, you can also try to use `utls` to construct the handshake function and call `SetTLSHandshake` of `Client` to customize it.

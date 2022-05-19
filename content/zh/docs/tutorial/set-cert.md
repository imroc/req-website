---
title: "设置证书"
description: "This article will introduce how to set certificates."
draft: false
images: []
weight: 262
menu:
  docs:
    parent: "tutorial"
toc: true
---

## Set Root Certificates

Use `SetRootCertsFromFile` or `SetRootCertFromString` to set root certificates:

```go
client := req.R()

// Set root cert from one or more pem files
client.SetRootCertsFromFile("/path/to/root/certs/pemFile1.pem", "/path/to/root/certs/pemFile2.pem", "/path/to/root/certs/pemFile3.pem")

// You can also set root cert from string
client.SetRootCertFromString("-----BEGIN CERTIFICATE-----XXXXXX-----END CERTIFICATE-----")
```

## Set Client Certificates

Use `SetCertFromFile` or `SetCerts` to set client certificates:

```go
client := req.R()

// Set client cert with key and cert file
client.SetCertFromFile("/path/to/client/certs/client.pem", "/path/to/client/certs/client.key") // Set client cert and key cert file

// Set client cert with tls.Certificate
cert1, err := tls.LoadX509KeyPair("/path/to/client/certs/client.pem", "/path/to/client/certs/client.key")
if err != nil {
    log.Fatalf("ERROR client certificate: %s", err)
}
// ...
client.SetCerts(cert1, cert2, cert3)
```

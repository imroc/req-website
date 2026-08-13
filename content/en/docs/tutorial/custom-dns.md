---
title: "Custom DNS"
description: "This article will introduce how to customize DNS resolution for HTTP/1 and HTTP/2."
draft: false
images: []
weight: 375
menu:
  docs:
    parent: "tutorial"
toc: true
---

By default `Req` uses the system resolver to translate hostnames into IP
addresses. For use cases such as crawling a known list of hosts, system DNS
lookups on dead hosts can cause long timeouts. This article shows how to
customize DNS resolution with a specific DNS server or a static hostname→IP
mapping.

> The following APIs only apply to HTTP/1 and HTTP/2 (the same scope as
> `Client.SetDial`). HTTP/3 is unchanged.

## Custom DNS Server

Use `Client.SetResolver` to route DNS queries to a specific server:

```go
import "net"

resolver := &net.Resolver{
    PreferGo: true,
    Dial: func(ctx context.Context, network, address string) (net.Conn, error) {
        var d net.Dialer
        return d.DialContext(ctx, "udp", "1.1.1.1:53")
    },
}

client := req.C().SetResolver(resolver)
```

`SetResolver` is implemented via `SetDial` with a `net.Dialer` that carries the
resolver. If `r` is nil, the default resolver is used.

## Static Hosts Mapping

Use `Client.SetHosts` to provide a hosts-file-style hostname→IP mapping. This is
fail-closed: hostnames not present in the map fail immediately with a
`no such host` error and never hit the system resolver, which avoids long DNS
timeouts when crawling with a known host list.

```go
client := req.C().SetHosts(map[string]string{
    "api.internal": "10.0.0.5",
    "db.internal":  "10.0.0.6",
    "v6.internal":  "::1", // brackets like "[::1]" are also accepted
})
```

Behavior notes:

- Keys are hostnames only (no port). Matching is case-insensitive and
  IDNA-normalized to match the dial address form used by the transport.
- Values must be literal IP addresses (IPv4 or IPv6). Non-IP values never fall
  through to system DNS; dialing that host returns a clear error instead.
- IP-literal request URLs (e.g. `https://1.2.3.4/`) skip the map and dial
  directly.
- An empty or nil map makes every non-literal hostname fail closed.
- Proxy routing is rejected while `SetHosts` is active, because a proxy can
  resolve the destination remotely and bypass the static mapping.
- The map is copied; later changes to the caller's map are ignored.

## Replacing Each Other

`SetDial`, `SetResolver`, `SetHosts`, and `SetUnixSocket` all configure the
underlying dialer and replace each other (the last call wins). For example,
if you call `SetHosts` and then `SetDial`, the custom dial function from
`SetDial` is used.

```go
// SetDial replaces the hosts dialer installed by SetHosts
client := req.C().SetHosts(map[string]string{"api.internal": "10.0.0.5"})
client.SetDial(func(ctx context.Context, network, addr string) (net.Conn, error) {
    // ...
})
```

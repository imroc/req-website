---
title: "自定义 DNS"
description: "介绍如何为 HTTP/1 和 HTTP/2 自定义 DNS 解析。"
draft: false
images: []
weight: 375
menu:
  docs:
    parent: "tutorial"
toc: true
---

默认情况下，`Req` 使用系统解析器把主机名转换成 IP 地址。在爬取已知主机列表等
场景中，失效主机上的系统 DNS 查询可能造成长时间超时。本文介绍如何用指定 DNS
服务器或静态主机名→IP 映射来自定义 DNS 解析。

> 以下 API 仅适用于 HTTP/1 和 HTTP/2（与 `Client.SetDial` 的作用范围一致），
> HTTP/3 不受影响。

## 自定义 DNS 服务器

使用 `Client.SetResolver` 把 DNS 查询路由到指定服务器：

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

`SetResolver` 通过 `SetDial` 和一个携带解析器的 `net.Dialer` 实现。如果 `r` 为
nil，则使用默认解析器。

## 静态 Hosts 映射

使用 `Client.SetHosts` 提供 hosts 文件风格的主机名→IP 映射。该映射采用
fail-closed 策略：映射中不存在的主机名会立即返回 `no such host` 错误，绝不
访问系统解析器，从而避免在爬取已知主机列表时遭受长时间 DNS 超时。

```go
client := req.C().SetHosts(map[string]string{
    "api.internal": "10.0.0.5",
    "db.internal":  "10.0.0.6",
    "v6.internal":  "::1", // 也接受 "[::1]" 这样的括号形式
})
```

行为说明：

- key 仅为主机名（不含端口）。匹配不区分大小写，并做 IDNA 规范化，与 transport
  使用的拨号地址形式保持一致。
- 值必须是字面 IP 地址（IPv4 或 IPv6）。非 IP 值绝不会回退到系统 DNS，而是
  在拨号该主机时返回明确的错误。
- IP 字面量请求 URL（例如 `https://1.2.3.4/`）会跳过映射并直接拨号。
- 空或 nil 映射会使所有非字面量主机名 fail-closed。
- `SetHosts` 生效期间会拒绝代理路由，因为代理可能在远端解析目标并绕过静态映射。
- 映射会被拷贝；之后对调用方 map 的修改将被忽略。

## 相互替换

`SetDial`、`SetResolver`、`SetHosts` 和 `SetUnixSocket` 都会配置底层拨号器，并且
相互替换（以最后一次调用为准）。例如，先调用 `SetHosts` 再调用 `SetDial`，则使用
`SetDial` 提供的自定义拨号函数。

```go
// SetDial 会替换 SetHosts 安装的 hosts 拨号器
client := req.C().SetHosts(map[string]string{"api.internal": "10.0.0.5"})
client.SetDial(func(ctx context.Context, network, addr string) (net.Conn, error) {
    // ...
})
```

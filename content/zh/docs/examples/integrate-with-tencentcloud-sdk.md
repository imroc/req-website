---
title: "与 tencentcloud-sdk-go 集成"
description: "介绍如何将 req 的调试能力集成到 tencentcloud-sdk-go 中"
lead: ""
draft: false
images: []
weight: 1400
menu:
  docs:
    parent: "examples"
toc: true
---

## 概述

`Req` 的 dump 和 debug 日志能力来自其实现的 `Transport` ，而 [tencentcloud-sdk-go](https://github.com/TencentCloud/tencentcloud-sdk-go) 提供了自定义 `Transport` 的能力，所以我们可以将 `Req` 的 `Transport` 集成进 `tencentcloud-sdk-go` 中，可以使用开关按需打开 debug 能力，看到请求所有细节，以便更方便的调试 API。

## 代码示例

```go
package main

import (
	"fmt"
	"github.com/imroc/req/v3"
	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common"
	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common/profile"
	dnspod "github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/dnspod/v20210323"
	"os"
	"strings"
)

func main() {
	// Read SECRET_ID and SECRET_KEY from env, create dnspod client with tencentcloud SDK.
	credential := common.NewCredential(os.Getenv("SECRET_ID"), os.Getenv("SECRET_KEY"))
	dnspodClient, err := dnspod.NewClient(credential, "", profile.NewClientProfile())
	if err != nil {
		panic(err)
	}
	if os.Getenv("DEBUG") == "true" { // Enable API debug when DEBUG=true.
		// Replace with Transport of req.
		dnspodClient.WithHttpTransport(req.DevMode().GetTransport())
	}

	// Create list domain request and send.
	r := dnspod.NewDescribeDomainListRequest()
	resp, err := dnspodClient.DescribeDomainList(r)
	if err != nil {
		panic(err)
	}

	// Display domain list.
	domains := resp.Response.DomainList
	if len(domains) == 0 {
		fmt.Println("empty domain list")
		return
	}
	list := []string{}
	for _, domain := range domains {
		list = append(list, *domain.Name)
	}
	fmt.Println("\n")
	fmt.Println("-----------------------")
	fmt.Println("domain list:", strings.Join(list, ","))
}
```

编译并运行:

```bash
$ go build -o test
$ export SECRET_ID=AKHD*****************************hiv
$ export SECRET_KEY=g3D2************************5nBR
$ ./test
-----------------------
domain list: imroc.cc,req.cool
```

打开 Debug，再运行:

```bash
$ export DEBUG=true
$ ./test
2022/05/26 14:53:10.030793 DEBUG [req] HTTP/1.1 POST https://dnspod.tencentcloudapi.com/
POST / HTTP/1.1
Host: dnspod.tencentcloudapi.com
User-Agent: req/v3 (https://github.com/imroc/req)
Content-Length: 2
Authorization: TC3-HMAC-SHA256 Credential=AKHD*****************************hiv/2022-05-26/dnspod/tc3_request, SignedHeaders=content-type;host, Signature=0c8*********************************************************bb23
Content-Type: application/json
X-TC-Action: DescribeDomainList
X-TC-Language: zh-CN
X-TC-RequestClient: SDK_GO_1.0.407
X-TC-Timestamp: 1653547989
X-TC-Version: 2021-03-23
Accept-Encoding: gzip

{}
HTTP/1.1 200 OK
Server: nginx
Date: Thu, 26 May 2022 06:53:10 GMT
Content-Type: application/json
Content-Length: 1341
Connection: keep-alive

{"Response":{"RequestId":"c7e5e642-7688-442b-bb39-6ca53ab03a78","DomainCountInfo":{"GroupTotal":0,"DomainTotal":2,"AllTotal":2,"MineTotal":2,"ShareTotal":0,"VipTotal":0,"PauseTotal":0,"ErrorTotal":1,"LockTotal":0,"SpamTotal":0,"VipExpire":0,"ShareOutTotal":0},"DomainList":[{"TTL":600,"CNAMESpeedup":"DISABLE","DNSStatus":"","DomainId":86423725,"Status":"ENABLE","Grade":"DP_FREE","GroupId":1,"Remark":"","CreatedOn":"2021-03-29 12:01:25","UpdatedOn":"2022-05-23 08:06:53","Punycode":"imroc.cc","Name":"imroc.cc","GradeLevel":2,"GradeTitle":"\u514d\u8d39\u7248","IsVip":"NO","Owner":"qcloud_uin_245671051@qcloud.com","VipStartAt":"0000-00-00 00:00:00","VipEndAt":"0000-00-00 00:00:00","VipAutoRenew":"NO","SearchEnginePush":"NO","RecordCount":33,"EffectiveDNS":["carol.dnspod.net","lyndon.dnspod.net"]},{"TTL":600,"CNAMESpeedup":"DISABLE","DNSStatus":"DNSERROR","DomainId":91979808,"Status":"ENABLE","Grade":"DP_FREE","GroupId":1,"Remark":"","CreatedOn":"2022-05-19 12:55:36","UpdatedOn":"2022-05-19 13:10:57","Punycode":"req.cool","Name":"req.cool","GradeLevel":2,"GradeTitle":"\u514d\u8d39\u7248","IsVip":"NO","Owner":"qcloud_uin_245671051@qcloud.com","VipStartAt":"0000-00-00 00:00:00","VipEndAt":"0000-00-00 00:00:00","VipAutoRenew":"NO","SearchEnginePush":"NO","RecordCount":1,"EffectiveDNS":["carol.dnspod.net","lyndon.dnspod.net"]}]}}
-----------------------
domain list: imroc.cc,req.cool
```

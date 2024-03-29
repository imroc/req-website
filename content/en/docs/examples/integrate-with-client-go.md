---
title: "Integrate with kubernetes client-go"
description: "This article will introduce how to integrate req with kubernetes client-go"
lead: ""
draft: false
images: []
weight: 1300
menu:
  docs:
    parent: "examples"
toc: true
---

## Example of client-go Dynamic Debugging

The dump capability of `Req` comes from its implementation of `Transport`, and the kubernetes sdk [client-go](https://github.com/kubernetes/client-go) provides the ability to customize `Transport`, so we can integrate the `Transport` of `Req` into `client-go`, You can use the switch to dynamically turn on the dump capability on demand and see all the details of the request, so that we can debug the K8S API.

```go
package main

import (
	"context"
	"fmt"
	"github.com/gin-gonic/gin"
	"time"

	"github.com/imroc/req/v3"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

var reqClient = req.C()

func init() {
	go func() {
		r := gin.Default()
		r.GET("/debug", func(c *gin.Context) {
			query := c.Query("enable")
			switch query {
			case "true": // Turn on debug with `curl 127.0.0.1:80/debug?enable=true`
				reqClient.EnableDumpAll()
				reqClient.EnableDebugLog()
				fmt.Println("Debug is enabled")
			case "false": // Turn off debug with `curl 127.0.0.1:80/debug?enable=false`
				reqClient.DisableDumpAll()
				reqClient.DisableDebugLog()
				fmt.Println("Debug is disabled")
			}
		})
		r.Run("0.0.0.0:80")
	}()
}

func main() {
	clientset := newClientset()
	for {
		// Run list services in kube-system for testing.
		services, err := clientset.CoreV1().Services("kube-system").List(context.TODO(), metav1.ListOptions{})
		if err != nil {
			panic(err.Error())
		}
		fmt.Printf("There are %d services in the kube-system cluster\n", len(services.Items))
		time.Sleep(10 * time.Second)
	}
}

// create kubernetes clientset
func newClientset() *kubernetes.Clientset {
	// Creates the in-cluster config
	config, err := rest.InClusterConfig()
	if err != nil {
		panic(err.Error())
	}

	replaceTransport(config, reqClient.GetTransport())

	// Create kubernetes client with config.
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}
	return clientset
}

// replace client-go's Transport with *req.Transport
func replaceTransport(config *rest.Config, t *req.Transport) {
	// Extract tls.Config from rest.Config
	tlsConfig, err := rest.TLSConfigFor(config)
	if err != nil {
		panic(err.Error())
	}
	// Set TLSClientConfig to req's Transport.
	t.TLSClientConfig = tlsConfig
	// Override with req's Transport.
	config.Transport = t
	// rest.Config.TLSClientConfig should be empty if
	// custom Transport been set.
	config.TLSClientConfig = rest.TLSClientConfig{}
}
```

Log into the container, use `curl 127.0.0.1:80/debug?enable=true` to enable dump, output example:

```txt
Debug is enabled
[GIN] 2022/05/24 - 08:39:04 | 200 |      20.408µs |       127.0.0.1 | GET      "/debug?enable=true"
2022/05/24 08:39:12.417151 DEBUG [req] HTTP/1.1 GET https://172.16.128.1:443/api/v1/namespaces/kube-system/services
GET /api/v1/namespaces/kube-system/services HTTP/1.1
Host: 172.16.128.1:443
User-Agent: clientgo/v0.0.0 (linux/amd64) kubernetes/$Format
Accept: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InFOWi02X25nOVFvR3JVc01OdDB4NGhXdlFZV3hKNGF2RDl3ajhtQWwyb28ifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJ0ZXN0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImNsaWVudGdvLXRva2VuLThzdDQ1Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImNsaWVudGdvIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiM2U5ZTA3Y2UtOWNkNC00ZGM1LTlkMzAtM2E3ZWZjODA2YTdkIiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OnRlc3Q6Y2xpZW50Z28ifQ.GQ1zqo-TbAoJQEpC17DGYFHJU-5Lk7lSIQx2HqoWfqjSN3-8P6zyWY2KOh4bFwe8kNOJ7ZmWqgfirhFueCP57tbKIZCSH5bqOWxhYG5y2haM5P5wC8mkkohaiFFKjkjOaKwJRFlE0WpdjLZBCm21sBM20yp5vf6qx3GW-2yyIcK4zfbF9A-kta1nxpSag6uABDDDfT8PD265LdLNnX4IRmLv2eT5qpZlPVYnGGOTqxVrFW0KAz7SG61MwrUkTGgQcXbKDc_BJ-VXOBJC3Aq2PWKGNa-NUlILKsFtfvxQPFfkZAHtbT3NqqHcHzlFe7dWStTP63uPT_vQmBpZZi510Q
Accept-Encoding: gzip

HTTP/1.1 200 OK
Audit-Id: 3faa17d9-f85d-45b9-8491-4482b2c7cb42
Cache-Control: no-cache, private
Content-Type: application/json
X-Kubernetes-Pf-Flowschema-Uid: 9f520a3c-dfd3-4a86-ac48-f028a7f1d9ca
X-Kubernetes-Pf-Prioritylevel-Uid: bbed4069-da01-42c3-bfd1-f9df05409c8d
Date: Tue, 24 May 2022 08:39:12 GMT
Transfer-Encoding: chunked

{"kind":"ServiceList","apiVersion":"v1","metadata":{"selfLink":"/api/v1/namespaces/kube-system/services","resourceVersion":"1025180975"},"items":[{"metadata":{"name":"csi-provisioner-cfsplugin","namespace":"kube-system","selfLink":"/api/v1/namespaces/kube-system/services/csi-provisioner-cfsplugin","uid":"dd3eae8d-4d0c-4b84-8d6c-c5537798e3e3","resourceVersion":"581529438","creationTimestamp":"2022-04-28T02:31:57Z","labels":{"app":"csi-provisioner-cfsplugin","app.kubernetes.io/managed-by":"Helm"},"annotations":{"meta.helm.sh/release-name":"cfs","meta.helm.sh/release-namespace":"kube-system"},"managedFields":[{"manager":"tke-application-controller","operation":"Update","apiVersion":"v1","time":"2022-04-28T02:31:57Z","fieldsType":"FieldsV1","fieldsV1":{"f:metadata":{"f:annotations":{".":{},"f:meta.helm.sh/release-name":{},"f:meta.helm.sh/release-namespace":{}},"f:labels":{".":{},"f:app":{},"f:app.kubernetes.io/managed-by":{}}},"f:spec":{"f:ports":{".":{},"k:{\"port\":12345,\"protocol\":\"TCP\"}":{".":{},"f:name":{},"f:port":{},"f:protocol":{},"f:targetPort":{}}},"f:selector":{".":{},"f:app":{}},"f:sessionAffinity":{},"f:type":{}}}}]},"spec":{"ports":[{"name":"dummy","protocol":"TCP","port":12345,"targetPort":12345}],"selector":{"app":"csi-provisioner-cfsplugin"},"clusterIP":"172.16.146.171","clusterIPs":["172.16.146.171"],"type":"ClusterIP","sessionAffinity":"None"},"status":{"loadBalancer":{}}},{"metadata":{"name":"hpa-metrics-service","namespace":"kube-system","selfLink":"/api/v1/namespaces/kube-system/services/hpa-metrics-service","uid":"34396faf-260a-4e02-b6f7-005a7ea457c0","resourceVersion":"162132658","creationTimestamp":"2022-04-05T08:52:57Z","managedFields":[{"manager":"tke-operator","operation":"Update","apiVersion":"v1","time":"2022-04-05T08:52:57Z","fieldsType":"FieldsV1","fieldsV1":{"f:spec":{"f:ports":{".":{},"k:{\"port\":443,\"protocol\":\"TCP\"}":{".":{},"f:port":{},"f:protocol":{},"f:targetPort":{}}},"f:sessionAffinity":{},"f:type":{}}}}]},"spec":{"ports":[{"protocol":"TCP","port":443,"targetPort":17443}],"clusterIP":"172.16.199.77","clusterIPs":["172.16.199.77"],"type":"ClusterIP","sessionAffinity":"None"},"status":{"loadBalancer":{}}},{"metadata":{"name":"kube-dns","namespace":"kube-system","selfLink":"/api/v1/namespaces/kube-system/services/kube-dns","uid":"1346b077-861a-4fe4-8fc1-e2df3f93fdaa","resourceVersion":"162133087","creationTimestamp":"2022-04-05T08:53:00Z","labels":{"addonmanager.kubernetes.io/mode":"Reconcile","kubernetes.io/cluster-service":"true","kubernetes.io/name":"CoreDNS"},"annotations":{"prometheus.io/port":"9153","prometheus.io/scrape":"true"},"managedFields":[{"manager":"tke-operator","operation":"Update","apiVersion":"v1","time":"2022-04-05T08:53:00Z","fieldsType":"FieldsV1","fieldsV1":{"f:metadata":{"f:annotations":{".":{},"f:prometheus.io/port":{},"f:prometheus.io/scrape":{}},"f:labels":{".":{},"f:addonmanager.kubernetes.io/mode":{},"f:kubernetes.io/cluster-service":{},"f:kubernetes.io/name":{}}},"f:spec":{"f:ports":{".":{},"k:{\"port\":53,\"protocol\":\"TCP\"}":{".":{},"f:name":{},"f:port":{},"f:protocol":{},"f:targetPort":{}},"k:{\"port\":53,\"protocol\":\"UDP\"}":{".":{},"f:name":{},"f:port":{},"f:protocol":{},"f:targetPort":{}}},"f:selector":{".":{},"f:k8s-app":{}},"f:sessionAffinity":{},"f:type":{}}}}]},"spec":{"ports":[{"name":"dns-tcp","protocol":"TCP","port":53,"targetPort":53},{"name":"dns","protocol":"UDP","port":53,"targetPort":53}],"selector":{"k8s-app":"kube-dns"},"clusterIP":"172.16.188.246","clusterIPs":["172.16.188.246"],"type":"ClusterIP","sessionAffinity":"None"},"status":{"loadBalancer":{}}},{"metadata":{"name":"metrics-service","namespace":"kube-system","selfLink":"/api/v1/namespaces/kube-system/services/metrics-service","uid":"c573ffbb-8fee-42e7-8be3-f2ea17c88a6b","resourceVersion":"162142845","creationTimestamp":"2022-04-05T08:54:03Z","managedFields":[{"manager":"nightsWatch","operation":"Update","apiVersion":"v1","time":"2022-04-05T08:54:03Z","fieldsType":"FieldsV1","fieldsV1":{"f:spec":{"f:ports":{".":{},"k:{\"port\":443,\"protocol\":\"TCP\"}":{".":{},"f:port":{},"f:protocol":{},"f:targetPort":{}}},"f:sessionAffinity":{},"f:type":{}}}}]},"spec":{"ports":[{"protocol":"TCP","port":443,"targetPort":443}],"clusterIP":"172.16.241.246","clusterIPs":["172.16.241.246"],"type":"ClusterIP","sessionAffinity":"None"},"status":{"loadBalancer":{}}},{"metadata":{"name":"tke-eni-ip-scheduler","namespace":"kube-system","selfLink":"/api/v1/namespaces/kube-system/services/tke-eni-ip-scheduler","uid":"eb39ef70-42d5-4c22-8963-09e56dc0257e","resourceVersion":"414993700","creationTimestamp":"2022-04-20T08:14:06Z","managedFields":[{"manager":"tke-controller-manager","operation":"Update","apiVersion":"v1","time":"2022-04-20T08:14:06Z","fieldsType":"FieldsV1","fieldsV1":{"f:spec":{"f:ports":{".":{},"k:{\"port\":80,\"protocol\":\"TCP\"}":{".":{},"f:port":{},"f:protocol":{},"f:targetPort":{}}},"f:selector":{".":{},"f:k8s-app":{}},"f:sessionAffinity":{},"f:type":{}}}}]},"spec":{"ports":[{"protocol":"TCP","port":80,"targetPort":50055}],"selector":{"k8s-app":"tke-eni-ip-scheduler"},"clusterIP":"172.16.215.46","clusterIPs":["172.16.215.46"],"type":"ClusterIP","sessionAffinity":"None"},"status":{"loadBalancer":{}}},{"metadata":{"name":"tke-eni-ipamd","namespace":"kube-system","selfLink":"/api/v1/namespaces/kube-system/services/tke-eni-ipamd","uid":"623b6005-1d9f-4c8f-8b06-96cf82179eb7","resourceVersion":"414993764","creationTimestamp":"2022-04-20T08:14:06Z","labels":{"k8s-app":"tke-eni-ipamd"},"managedFields":[{"manager":"tke-controller-manager","operation":"Update","apiVersion":"v1","time":"2022-04-20T08:14:06Z","fieldsType":"FieldsV1","fieldsV1":{"f:metadata":{"f:labels":{".":{},"f:k8s-app":{}}},"f:spec":{"f:ports":{".":{},"k:{\"port\":8080,\"protocol\":\"TCP\"}":{".":{},"f:name":{},"f:port":{},"f:protocol":{},"f:targetPort":{}}},"f:selector":{".":{},"f:k8s-app":{}},"f:sessionAffinity":{},"f:type":{}}}}]},"spec":{"ports":[{"name":"health-checker","protocol":"TCP","port":8080,"targetPort":"health-checker"}],"selector":{"k8s-app":"tke-eni-ipamd"},"clusterIP":"172.16.197.177","clusterIPs":["172.16.197.177"],"type":"ClusterIP","sessionAffinity":"None"},"status":{"loadBalancer":{}}},{"metadata":{"name":"tke-kube-state-metrics","namespace":"kube-system","selfLink":"/api/v1/namespaces/kube-system/services/tke-kube-state-metrics","uid":"5af674c4-cde5-444e-88c0-a8f5e26e431f","resourceVersion":"960529222","creationTimestamp":"2022-05-20T07:59:31Z","labels":{"app.kubernetes.io/name":"kube-state-metrics","app.kubernetes.io/version":"1.9.7","controlled-by":"tke"},"managedFields":[{"manager":"prometheus-cloud","operation":"Update","apiVersion":"v1","time":"2022-05-20T07:59:31Z","fieldsType":"FieldsV1","fieldsV1":{"f:metadata":{"f:labels":{".":{},"f:app.kubernetes.io/name":{},"f:app.kubernetes.io/version":{},"f:controlled-by":{}}},"f:spec":{"f:clusterIP":{},"f:ports":{".":{},"k:{\"port\":8180,\"protocol\":\"TCP\"}":{".":{},"f:name":{},"f:port":{},"f:protocol":{},"f:targetPort":{}},"k:{\"port\":8181,\"protocol\":\"TCP\"}":{".":{},"f:name":{},"f:port":{},"f:protocol":{},"f:targetPort":{}}},"f:selector":{".":{},"f:app.kubernetes.io/name":{},"f:controlled-by":{}},"f:sessionAffinity":{},"f:type":{}}}}]},"spec":{"ports":[{"name":"http-metrics","protocol":"TCP","port":8180,"targetPort":"http-metrics"},{"name":"telemetry","protocol":"TCP","port":8181,"targetPort":"telemetry"}],"selector":{"app.kubernetes.io/name":"kube-state-metrics","controlled-by":"tke"},"clusterIP":"None","clusterIPs":["None"],"type":"ClusterIP","sessionAffinity":"None"},"status":{"loadBalancer":{}}},{"metadata":{"name":"tke-node-exporter","namespace":"kube-system","selfLink":"/api/v1/namespaces/kube-system/services/tke-node-exporter","uid":"2aeaffb0-556c-44ad-a4d8-5b5a1a70b2b5","resourceVersion":"960529274","creationTimestamp":"2022-05-20T07:59:31Z","labels":{"app.kubernetes.io/name":"node-exporter","app.kubernetes.io/version":"v0.18.1","controlled-by":"tke"},"managedFields":[{"manager":"prometheus-cloud","operation":"Update","apiVersion":"v1","time":"2022-05-20T07:59:31Z","fieldsType":"FieldsV1","fieldsV1":{"f:metadata":{"f:labels":{".":{},"f:app.kubernetes.io/name":{},"f:app.kubernetes.io/version":{},"f:controlled-by":{}}},"f:spec":{"f:clusterIP":{},"f:ports":{".":{},"k:{\"port\":9100,\"protocol\":\"TCP\"}":{".":{},"f:name":{},"f:port":{},"f:protocol":{},"f:targetPort":{}}},"f:selector":{".":{},"f:app.kubernetes.io/name":{},"f:controlled-by":{}},"f:sessionAffinity":{},"f:type":{}}}}]},"spec":{"ports":[{"name":"target","protocol":"TCP","port":9100,"targetPort":"target"}],"selector":{"app.kubernetes.io/name":"node-exporter","controlled-by":"tke"},"clusterIP":"None","clusterIPs":["None"],"type":"ClusterIP","sessionAffinity":"None"},"status":{"loadBalancer":{}}}]}


There are 8 services in the kube-system cluster
```

Similarly, after debugging, you can use `curl 127.0.0.1:80/debug?enable=false` to turn off dump.

## An Example of client-go Integrating OpenTelemetry to Support Tracing

```go
import (
  "bytes"
  "github.com/imroc/req/v3"
  "go.opentelemetry.io/otel"
  "go.opentelemetry.io/otel/attribute"
  "go.opentelemetry.io/otel/codes"
  "io"
  metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
  "k8s.io/client-go/kubernetes"
  "k8s.io/client-go/rest"
  "net/http"
)

var clientset *kubernetes.Clientset

const tracerName = "controller"

// converts http header to a string.
func convertHeaderToString(h http.Header) string {
  if h == nil {
    return ""
  }
  buf := new(bytes.Buffer)
  h.Write(buf)
  return buf.String()
}

func init() {
  // Create a *req.Transport with middleware
  t := req.C().GetTransport().WrapRoundTripFunc(func(rt http.RoundTripper) req.HttpRoundTripFunc {
    return func(req *http.Request) (resp *http.Response, err error) {
      _, span := otel.Tracer(tracerName).Start(req.Context(), req.URL.Path)
      defer span.End()
      span.SetAttributes(
        attribute.String("http.url", req.URL.String()),
        attribute.String("http.method", req.Method),
        attribute.String("http.req.header", convertHeaderToString(req.Header)),
      )
      resp, err = rt.RoundTrip(req)
      if err != nil {
        span.RecordError(err)
        span.SetStatus(codes.Error, err.Error())
        return
      } else if !(resp.StatusCode >= 200 && resp.StatusCode < 300) {
        span.SetStatus(codes.Error, fmt.Sprintf("bad status: %s", resp.Status))
      }
      span.SetAttributes(
        attribute.Int("http.status_code", resp.StatusCode),
        attribute.String("http.resp.header", convertHeaderToString(resp.Header)),
      )
      if resp.Body != nil {
        body := resp.Body
        defer body.Close()
        bodyContent, err := io.ReadAll(body)
        if err != nil {
          span.RecordError(err)
          span.SetStatus(codes.Error, err.Error())
          return nil, err
        }
        // rewind body
        resp.Body = io.NopCloser(bytes.NewReader(bodyContent))
        // record response body
        span.SetAttributes(
          attribute.String("http.resp.body", string(bodyContent)),
        )
      }
      return
    }
  })

  clientset = newClientset(t)
}

// create kubernetes clientset
func newClientset(t *req.Transport) *kubernetes.Clientset {
  // Creates the in-cluster config
  config, err := rest.InClusterConfig()
  if err != nil {
    panic(err.Error())
  }

  replaceTransport(config, t)

  // Create kubernetes client with config.
  clientset, err := kubernetes.NewForConfig(config)
  if err != nil {
    panic(err.Error())
  }
  return clientset
}

// replace client-go's Transport with *req.Transport
func replaceTransport(config *rest.Config, t *req.Transport) {
  // Extract tls.Config from rest.Config
  tlsConfig, err := rest.TLSConfigFor(config)
  if err != nil {
    panic(err.Error())
  }
  // Set TLSClientConfig to req's Transport.
  t.TLSClientConfig = tlsConfig
  // Override with req's Transport.
  config.Transport = t
  // rest.Config.TLSClientConfig should be empty if
  // custom Transport been set.
  config.TLSClientConfig = rest.TLSClientConfig{}
}
```

<img src="/images/support-jaeger-using-transport-middleware-in-client-go.png">

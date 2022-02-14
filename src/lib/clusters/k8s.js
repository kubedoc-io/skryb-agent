import k8s from "@kubernetes/client-node";
import { Observable, ReplaySubject } from "rxjs";
import { filter } from "rxjs/operators";
import Operator from "@dot-i/k8s-operator";
import fos from "filter-objects";

class SkrybOperator extends Operator.default {
  constructor(resources_) {
    super();
    this.resources_ = resources_;
  }
  async init() {
    const pushEvent = e => this.resources_.next({ type: e.type, resource: e.object });

    try {
      // Watch ALL resources
      return await Promise.all([
        this.watchResource("", "v1", "namespaces", pushEvent),
        this.watchResource("", "v1", "services", pushEvent),
        this.watchResource("", "v1", "pods", pushEvent),
        this.watchResource("", "v1", "persistentvolumeclaims", pushEvent),
        this.watchResource("", "v1", "configmaps", pushEvent),
        this.watchResource("", "v1", "secrets", pushEvent),
        this.watchResource("", "v1", "replicationcontrollers", pushEvent),
        this.watchResource("apps", "v1", "deployments", pushEvent),
        this.watchResource("apps", "v1", "statefulsets", pushEvent),
        this.watchResource("apps", "v1", "replicasets", pushEvent),
        this.watchResource("apps", "v1", "daemonsets", pushEvent),
        this.watchResource("batch", "v1", "jobs", pushEvent),
        this.watchResource("batch", "v1", "cronjobs", pushEvent)
      ]);
    } catch (err) {
      console.log("operating init error", err);
    }
  }
}

export function k8sCloudFactory(cloudSpec) {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();

  const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
  const k8sExtApi = kc.makeApiClient(k8s.ApiextensionsV1Api);
  const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
  const k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);
  const k8sBatchApi = kc.makeApiClient(k8s.BatchV1Api);

  function listCRDs() {
    return new Observable(function (obs) {
      k8sExtApi.listCustomResourceDefinition().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "CustomResourceDefinition" } }));
      });
    });
  }

  function listNamespaces() {
    return new Observable(function (obs) {
      k8sCoreApi.listNamespace().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "Namespace" } }));
      });
    });
  }

  function listServices() {
    return new Observable(function (obs) {
      k8sCoreApi.listServiceForAllNamespaces().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "Service" } }));
      });
    });
  }

  function listDeployments() {
    return new Observable(function (obs) {
      k8sAppsApi.listDeploymentForAllNamespaces().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "Deployment" } }));
      });
    });
  }

  function listStatefulSets() {
    return new Observable(function (obs) {
      k8sAppsApi.listStatefulSetForAllNamespaces().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "StatefulSet" } }));
      });
    });
  }

  function listDaemonSets() {
    return new Observable(function (obs) {
      k8sAppsApi.listDaemonSetForAllNamespaces().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "DaemonSet" } }));
      });
    });
  }

  function listReplicaSets() {
    return new Observable(function (obs) {
      k8sAppsApi.listReplicaSetForAllNamespaces().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "ReplicaSet" } }));
      });
    });
  }

  function listEndpoints() {
    return new Observable(function (obs) {
      k8sCoreApi.listEndpointsForAllNamespaces().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "Endpoint" } }));
      });
    });
  }

  function listIngresses() {
    return new Observable(function (obs) {
      k8sNetworkingApi.listIngressForAllNamespaces().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "Ingress" } }));
      });
    });
  }

  function listReplicationControllers() {
    return new Observable(function (obs) {
      k8sCoreApi.listReplicationControllerForAllNamespaces().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "ReplicationController" } }));
      });
    });
  }

  function listSecrets() {
    return new Observable(function (obs) {
      k8sCoreApi.listSecretForAllNamespaces().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "Secret" } }));
      });
    });
  }

  function listPods() {
    return new Observable(function (obs) {
      k8sCoreApi.listPodForAllNamespaces().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "Pod" } }));
      });
    });
  }

  function listPVCs() {
    return new Observable(function (obs) {
      k8sCoreApi.listPersistentVolumeClaimForAllNamespaces().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "PersistentVolumeClaim" } }));
      });
    });
  }

  function listConfigMaps() {
    return new Observable(function (obs) {
      k8sCoreApi.listConfigMapForAllNamespaces().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "ConfigMap" } }));
      });
    });
  }

  function listJobs() {
    return new Observable(function (obs) {
      k8sBatchApi.listJobForAllNamespaces().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "Job" } }));
      });
    });
  }

  function listCronJobs() {
    return new Observable(function (obs) {
      k8sBatchApi.listCronJobForAllNamespaces().then(result => {
        result.body.items.map(srv => obs.next({ type: "ADDED", resource: { ...srv, apiVersion: result.body.apiVersion, kind: "CronJob" } }));
      });
    });
  }

  function filterResources({ resource }) {
    let included = true;

    if (cloudSpec.resources.includes) {
      included = cloudSpec.resources.includes.reduce((included, pattern) => included || fos.matches(pattern, resource), false);
    }

    if (cloudSpec.resources.excludes) {
      included = cloudSpec.resources.excludes.reduce((excluded, pattern) => excluded && fos.matches(pattern, resource), included);
    }

    return included;
  }

  return {
    snapshot() {
      const resources_ = new ReplaySubject();

      async function processResources() {
        listNamespaces().subscribe(resources_);

        // SERVICES
        listServices().subscribe(resources_);
        listEndpoints().subscribe(resources_);
        listIngresses().subscribe(resources_);

        // WORKLOADS
        listDeployments().subscribe(resources_);
        listReplicationControllers().subscribe(resources_);
        listStatefulSets().subscribe(resources_);
        listPods().subscribe(resources_);
        listReplicaSets().subscribe(resources_);
        listDaemonSets().subscribe(resources_);
        listJobs().subscribe(resources_);
        listCronJobs().subscribe(resources_);

        // STORAGE
        listPVCs().subscribe(resources_);

        // CONFIG
        listSecrets().subscribe(resources_);
        listConfigMaps().subscribe(resources_);

        // CRDS
        listCRDs().subscribe(crd => {
          //TODO: retrieve resources for this crd and push them in resources stream
          // See raw example to list all resources for this crd (group.name), versions

          // push this crd
          resources_.next(crd);
        });
      }
      processResources();

      return resources_.pipe(filter(filterResources)).asObservable();
    },
    monitor() {
      const resources_ = new ReplaySubject();

      async function watchResources() {
        try {
          // instantiate the operator
          const monitor = new SkrybOperator(resources_);
          await monitor.init();
          await monitor.start();
          console.log("monitor is started");
        } catch (err) {
          console.error("unable to start monitor", err);
        }
      }
      watchResources();

      return resources_.pipe(filter(filterResources)).asObservable();
    }
  };
}

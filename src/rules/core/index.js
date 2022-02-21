/**
 * Core Ruleset
 */
import { ruleSetBuilder } from "../../lib/ruleset.js";
import { coreAnnotations } from "../../lib/core-markers.js";

// handle system, subsystem with namespaces
// microservices with deployments, etc.
// resources with statefulsets and deployments, etc.  we can detect a number of db using the exposed ports... queue, etc.
//

function systemInfoFromNamespace(ns, model) {
  const mutations = [];
  // kubedoc.io/type: system
  // kubedoc.io/part-of: kubedoc
  // kubedoc.io/release: alpha1
  // kubedoc.io/version: '1.0.0'
  // kubedoc.io/summary: Extract data from your kubernetes cluster to feed your Kubedoc developer portal2
  // kubedoc.io/homepage: https://kubedoc.io/

  const system = {
    name: ns.metadata.name
  };

  if (ns.metadata.annotations) {
    system.type = ns.metadata.annotations[coreAnnotations.type];
    system.summary = ns.metadata.annotations[coreAnnotations.summary];
    system.homepage = ns.metadata.annotations[coreAnnotations.homepage];
    system.version = ns.metadata.annotations[coreAnnotations.version];
    system.release = ns.metadata.annotations[coreAnnotations.release];
    system.partOf = ns.metadata.annotations[coreAnnotations.partOf];

    if (!model.systems.find(s => s.name === system.partOf)) {
      mutations.push({ type: "SET_SYSTEM", data: { name: system.partOf, type: "system" } });
    }
  }

  mutations.push({ type: "SET_SYSTEM", data: system });

  return mutations;
}

function microserviceInfoFromController(controller) {
  const target = {
    name: controller.metadata.name
  };

  return { type: "SET_MICROSERVICE", data: target };
}

function extractService(service, model) {
  const mutations = [];

  const target = {
    name: service.metadata.name
  };

  if (service.metadata.labels) {
    // app.kubernetes.io/name: skryb-agent
    // app.kubernetes.io/component: service
    // app.kubernetes.io/part-of: kubedoc
    // app.kubernetes.io/version: "1.0.0"

    if (service.metadata.labels["app.kubernetes.io/name"]) {
      target.name === service.metadata.labels["app.kubernetes.io/name"];
    }

    if (service.metadata.labels["app.kubernetes.io/component"]) {
      target.type = service.metadata.labels["app.kubernetes.io/component"];
    }

    if (service.metadata.labels["app.kubernetes.io/version"]) {
      target.version = service.metadata.labels["app.kubernetes.io/version"];
    }

    if (service.metadata.labels["app.kubernetes.io/part-of"]) {
      target.partOf = service.metadata.labels["app.kubernetes.io/part-of"];

      if (!model.systems.find(s => s.name === target.partOf)) {
        mutations.push({ type: "SET_SYSTEM", data: { name: target.partOf, type: "system" } });
      }
    }
  }

  if (service.metadata.annotations) {
    // kubedoc.io/type: system
    // kubedoc.io/part-of: kubedoc
    // kubedoc.io/release: alpha1
    // kubedoc.io/version: '1.0.0'
    // kubedoc.io/summary: Extract data from your kubernetes cluster to feed your Kubedoc developer portal2
    // kubedoc.io/component: system
    // kubedoc.io/source-control: github::kubedoc-io/skryb-agent
    // kubedoc.io/sc-branch: main
    // kubedoc.io/issue-tracker: github::kubedoc-io/skryb-agent
    // kubedoc.io/ci: github::kubedoc-io/skryb-agent
    // kubedoc.io/cd: argodb::kubedoc/skryb
    // kubedoc.io/managed-by: argocd
    // kubedoc.io/created-by: jgrenon

    if (service.metadata.annotations[coreAnnotations.type]) {
      target.type = service.metadata.annotations[coreAnnotations.type];
    }

    if (service.metadata.annotations[coreAnnotations.component]) {
      target.type = service.metadata.annotations[coreAnnotations.component];
    }
    if (service.metadata.annotations[coreAnnotations.summary]) {
      target.summary = service.metadata.annotations[coreAnnotations.summary];
    }
    if (service.metadata.annotations[coreAnnotations.release]) {
      target.release = service.metadata.annotations[coreAnnotations.release];
    }
    if (service.metadata.annotations[coreAnnotations.version]) {
      target.version = service.metadata.annotations[coreAnnotations.version];
    }
    if (service.metadata.annotations[coreAnnotations.sourceControl]) {
      target.sourceControl = service.metadata.annotations[coreAnnotations.sourceControl];
    }
    if (service.metadata.annotations[coreAnnotations.scBranch]) {
      target.scBranch = service.metadata.annotations[coreAnnotations.scBranch];
    }
    if (service.metadata.annotations[coreAnnotations.issuesTracker]) {
      target.issuesTracker = service.metadata.annotations[coreAnnotations.issuesTracker];
    }
    if (service.metadata.annotations[coreAnnotations.issueTracker]) {
      target.issuesTracker = service.metadata.annotations[coreAnnotations.issueTracker];
    }
    if (service.metadata.annotations[coreAnnotations.ci]) {
      target.ci = service.metadata.annotations[coreAnnotations.ci];
    }
    if (service.metadata.annotations[coreAnnotations.cd]) {
      target.cd = service.metadata.annotations[coreAnnotations.cd];
    }
    if (service.metadata.annotations[coreAnnotations.createdBy]) {
      target.createdBy = service.metadata.annotations[coreAnnotations.createdBy];
    }
    if (service.metadata.annotations[coreAnnotations.updatedBy]) {
      target.updatedBy = service.metadata.annotations[coreAnnotations.updatedBy];
    }
    if (service.metadata.annotations[coreAnnotations.managedBy]) {
      target.managedBy = service.metadata.annotations[coreAnnotations.managedBy];
    }

    if (service.metadata.annotations[coreAnnotations.partOf]) {
      target.partOf = service.metadata.annotations[coreAnnotations.partOf];
      if (!model.systems.find(s => s.name === target.partOf)) {
        mutations.push({ type: "SET_SYSTEM", data: { name: target.partOf, type: "system" } });
      }
    }
  }

  // Extract infos from spec
  if (service.spec) {
    target.clusterInfo = service.spec;
  }

  mutations.push({ type: "SET_MICROSERVICE", data: target });
  return mutations;
}

function extractConfigResource(configMap, model) {
  const mutations = [];

  const target = {
    type: "config",
    name: configMap.metadata.name,
    partOf: configMap.metadata.namespace,
    data: configMap.data
  };

  if (configMap.metadata.annotations) {
    if (configMap.metadata.annotations[coreAnnotations.partOf]) {
      target.partOf = configMap.metadata.annotations[coreAnnotations.partOf];
    }
  }

  if (!model.systems.find(s => s.name === target.partOf)) {
    mutations.push({ type: "SET_SYSTEM", data: { name: target.partOf, type: "system" } });
  }

  mutations.push({ type: "SET_RESOURCE", data: target });

  return mutations;
}

export default function coreRuleSetBuilder(project, mutations_, { model, hub } = {}) {
  return ruleSetBuilder(project, mutations_, { model, hub })
    .addRule({ kind: "Namespace" }, systemInfoFromNamespace)
    .addRule({ kind: { $in: ["Deployment", "StatefulSet"] } }, microserviceInfoFromController)
    .addRule({ kind: "Service" }, extractService)
    .addRule({ kind: "ConfigMap" }, extractConfigResource)
    .build();
}

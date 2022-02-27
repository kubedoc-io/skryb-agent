/**
 * Core Ruleset
 */
import { ruleSetBuilder, resourceMatcher, coreAnnotations, k8sLabels } from "../../lib/index.js";
import _ from "lodash";

function modelMapAnnotations(obj, target, annotations = coreAnnotations) {
  if (!obj || !obj.metadata || !obj.metadata.annotations) {
    return {};
  }
  return _.reduce(
    annotations,
    (model, val, key) => {
      if (obj.metadata.annotations[val]) {
        model[key] = obj.metadata.annotations[val];
      }
      return model;
    },
    target
  );
}

function modelMapLabels(obj, target, labels = []) {
  if (!obj || !obj.metadata || !obj.metadata.labels) {
    return {};
  }
  return _.reduce(
    labels,
    (model, val, key) => {
      if (obj.metadata.labels[val]) {
        model[key] = obj.metadata.labels[val];
      }
      return model;
    },
    target
  );
}

function systemInfoFromNamespace(ns, model) {
  const mutations = [];

  const system = {
    name: ns.metadata.name
  };

  modelMapAnnotations(ns, system, coreAnnotations);
  modelMapLabels(ns, system, k8sLabels);

  if (system.partOf && !model.systems.find(s => s.name === system.partOf)) {
    mutations.push({ type: "SET_SYSTEM", data: { name: system.partOf, type: "system" } });
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

  modelMapAnnotations(service, target, coreAnnotations);
  modelMapLabels(service, target, k8sLabels);

  if (target.partOf && !model.systems.find(s => s.name === target.partOf)) {
    mutations.push({ type: "SET_SYSTEM", data: { name: target.partOf, type: "system" } });
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

  modelMapAnnotations(configMap, target, coreAnnotations);
  modelMapLabels(configMap, target, k8sLabels);

  if (!model.systems.find(s => s.name === target.partOf)) {
    mutations.push({ type: "SET_SYSTEM", data: { name: target.partOf, type: "system" } });
  }

  mutations.push({ type: "SET_RESOURCE", data: target });

  return mutations;
}

export default function coreRuleSetBuilder(project, mutations_, { model, hub } = {}) {
  return ruleSetBuilder(project, mutations_, { model, hub })
    .addRule(resourceMatcher({ kind: { $eq: "Namespace" } }), systemInfoFromNamespace)
    .addRule(resourceMatcher({ kind: { $in: ["Deployment", "StatefulSet"] } }), microserviceInfoFromController)
    .addRule(resourceMatcher({ kind: { $eq: "Service" } }), extractService)
    .addRule(resourceMatcher({ kind: { $eq: "ConfigMap" } }), extractConfigResource)
    .build();
}

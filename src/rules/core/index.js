/**
 * Core Ruleset
 */
import { ruleSetBuilder } from "../../lib/ruleset.js";
import { coreAnnotations } from "../../lib/core-markers.js";

// handle system, subsystem with namespaces
// microservices with deployments, etc.
// resources with statefulsets and deployments, etc.  we can detect a number of db using the exposed ports... queue, etc.
//

function systemInfoFromNamespace(ns) {
  // extract data from namespace
  console.log(ns.metadata.annotations);

  const system = {
    name: ns.metadata.name
  };

  if (ns.metadata.annotations) {
    system.system = ns.metadata.annotations[coreAnnotations.system];
    system.summary = ns.metadata.annotations[coreAnnotations.summary];
    system.homepage = ns.metadata.annotations[coreAnnotations.homepage];
  }

  return { type: "SET_SYSTEM", data: system };
}

function microserviceInfoFromController(controller) {
  console.log("extracting microservice details from controller", controller.metadata.name, controller.kind);
  return { type: "SET_MICROSERVICE", data: {} };
}

export default function coreRuleSetBuilder(project, mutations_) {
  return ruleSetBuilder(project, mutations_)
    .addRule({ kind: "Namespace" }, systemInfoFromNamespace)
    .addRule({ kind: { $in: ["Deployment", "StatefulSet", "ReplicaSet"] } }, microserviceInfoFromController)
    .build();
}

import { k8sCloudFactory } from "./clusters/k8s.js";
import _ from "lodash";

export function cloudFactory(project) {
  const cloudSpec = _.isString(project.cloud) ? { type: project.cloud } : project.cloud || { type: "k8s" };

  switch (cloudSpec.type) {
    case "k8s":
      return k8sCloudFactory(cloudSpec);
    default:
      return null;
  }
}

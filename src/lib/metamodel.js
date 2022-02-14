import { memoryModel } from "./models/memory.js";
import _ from "lodash";

export function metaModelFactory(project) {
  if (project.model) {
    const driver = _.isString(project.model) ? project.model : project.model.driver;

    switch (driver) {
      case "sql":
      case "cloud":
        console.log("not supported yet");
        break;
      case "memory":
        return memoryModel(project);
    }
  } else {
    return memoryModel(project);
  }
}

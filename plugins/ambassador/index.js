import { ruleSetBuilder } from "@skryb/core";
import _ from "lodash";
import { extractServiceInfos } from "./rules/extract-service-infos.js";

export default function ambassadorPlugin(project, config, { matchers }) {
  const { resourceMatcher } = matchers;

  return {
    installRuleSet(project, mutations_, { model, hub }) {
      console.log("Installing ambassador ruleset");
      return ruleSetBuilder(project, mutations_, { model, hub })
        .addRule(resourceMatcher({ kind: "Service" }), extractServiceInfos)
        .build();
    },
  };
}

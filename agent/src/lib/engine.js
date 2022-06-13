import { Subject } from "rxjs";
import coreRuleSetBuilder from "../rules/core/index.js";

export function engineFactory({ project, model, plugins = [], hub }) {
  const resources_ = new Subject();
  const mutations_ = new Subject();
  const rulesets = [];

  // load all rules
  rulesets.push(coreRuleSetBuilder(project, mutations_, { model, hub }));

  // loop through all plugins
  rulesets.push(...plugins.map(plugin => plugin.installRuleSet && plugin.installRuleSet(project, mutations_, { model, hub })));

  // a rule that look for a version-control annotation with value github. It will use a token in the project context and retrieve a bunch of facts for the specified repo
  // another rule might look for a version-control git only and will retrieve generic git details from history and branches.
  // the rule could retrieve the list of committers and reviewers in order to start building teams...

  // we need to build as much content as we can without forcing teams to manually create content.

  // namespace rule looking for system or sub-system rules and producing a mutation for a system or subsystem entity
  // could look for part-of, homepage, issue tracker, wiki, etc.

  // rulesets are dynamic and extensible, so customers wishing to include specific products or support will just have to add more rule sets
  // to their skryb daemon (npm install in derived docker image)

  // connect all rulesets to our resources subject
  rulesets.map(ruleset => resources_.subscribe(ruleset.$));

  return {
    mutations_,
    process({ type, changes, resource }) {
      resources_.next({ type, changes, resource });
      return mutations_.asObservable();
    },
  };
}

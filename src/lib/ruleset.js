import { find } from "query-collection";

function ruleset({ rules, project, mutations_ }) {
  return {
    $: function (resource) {
      rules.map(rule => {
        if (find([resource], rule.expr).length > 0) {
          const mutation = rule.mutator(resource);
          if (mutation) {
            console.log("sending mutations to metamodel", mutation);
            mutations_.next(mutation);
          }
        }
      });
    }
  };
}

export function ruleSetBuilder(project, mutations_) {
  const rules = [];

  const builder = {
    addRule(expr, mutator) {
      rules.push({ expr, mutator });
      return this;
    },
    build() {
      return ruleset({ rules, project, mutations_ });
    }
  };

  return builder;
}

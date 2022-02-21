import mm from "micromongo";

function ruleset({ rules, mutations_, model }) {
  return {
    $: function (event) {
      const state = model.getSnapshot();
      rules.map(rule => {
        if (rule.matches(event)) {
          const mutations = rule.mutator(event.changes || event.resource, state, mutations_);
          if (mutations) {
            mutations_.next(mutations);
          }
        }
      });
    }
  };
}

function ruleFactory(spec) {
  return {
    expr: spec.expr,
    matches(event) {
      if (event.type === "MODEL") {
        return mm.find(event.changes, spec.expr).length > 0;
      } else {
        if (event.resource) {
          return mm.find([event.resource], spec.expr).length > 0;
        } else {
          return false;
        }
      }
    },
    mutator: spec.mutator
  };
}

export function ruleSetBuilder(project, mutations_, { model, hub }) {
  const rules = [];

  const builder = {
    addRule(expr, mutator) {
      rules.push(ruleFactory({ expr, mutator }));
      return this;
    },
    build() {
      return ruleset({ rules, project, mutations_, model, hub });
    }
  };

  return builder;
}

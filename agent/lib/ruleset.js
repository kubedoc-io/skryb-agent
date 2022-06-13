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
    matcher: spec.matcher,
    matches(event) {
      return spec.matcher(event);
    },
    mutator: spec.mutator
  };
}

export function ruleSetBuilder(project, mutations_, { model, hub }) {
  const rules = [];

  const builder = {
    addRule(matcher, mutator) {
      rules.push(ruleFactory({ matcher, mutator }));
      return this;
    },
    build() {
      return ruleset({ rules, project, mutations_, model, hub });
    }
  };

  return builder;
}

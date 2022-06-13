import Yaml from "js-yaml";
import * as Path from "path";
import fs from "fs";
import chalk from "chalk";
import _ from "lodash";
import { resourceMatcher } from "./resource-matcher.js";
import { modelChangeMatcher } from "./model-change-matcher.js";

export async function projectLoader({ path = "./skryb.yaml" } = {}) {
  console.log("loading yaml project spec", path);
  const _state = { model: "v1" };

  const platform = {
    matchers: {
      resourceMatcher,
      modelChangeMatcher
    }
  };

  const projectApi = {
    async initPlugins(opts) {
      console.log("initializing all plugins", _state.config.plugins);
      return await Promise.all(
        (_state.config.plugins || []).map(async pluginSpec => {
          if (_.isString(pluginSpec)) {
            const pluginFactory = await import(Path.resolve(pluginSpec, "index.js"));
            console.log("plugin factory", pluginFactory);
            return pluginFactory.default({ ..._state.config, ...projectApi }, opts, platform);
          } else {
            const pluginFactory = await import(Path.resolve(pluginSpec.module, "index.js"));
            console.log("plugin factory", pluginFactory);
            return pluginFactory.default({ ..._state.config, ...projectApi }, { ...pluginSpec, ...opts }, platform);
          }
        })
      );
    }
  };

  try {
    _state.config = Yaml.load(fs.readFileSync(Path.resolve(path), "utf8"));
    return { ..._state.config, ...projectApi };
  } catch (err) {
    console.log(chalk.yellowBright.bold("using default project settings. to override, create a `skryb.yaml` file in the current folder"));
    return {
      model: "v1",
      ...projectApi
    };
  }
}

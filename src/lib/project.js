import Yaml from "js-yaml";
import * as Path from "path";
import fs from "fs";
import chalk from "chalk";

export async function projectLoader({ path = "./skryb.yaml" } = {}) {
  console.log("loading yaml project spec", path);
  try {
    return Yaml.load(fs.readFileSync(Path.resolve(path), "utf8"));
  } catch (err) {
    console.log(chalk.yellowBright.bold("using default project settings. to override, create a `skryb.yaml` file in the current folder"));
    return {
      model: "v1"
    };
  }
}

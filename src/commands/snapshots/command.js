import { projectLoader } from "../../lib/project.js";
import { metaModelFactory } from "../../lib/metamodel.js";
import { hubFactory } from "../../lib/hub.js";
import { cloudFactory } from "../../lib/cloud.js";
import { engineFactory } from "../../lib/engine.js";

//TODO: Plugins have to be loaded from their own module
import { githubPlugin } from "../../../plugins/github/index.js";

export async function snapshot(opts = {}) {
  const project = await projectLoader({ path: opts.project });

  // load all plugins
  const plugins = [githubPlugin(project)];

  const clusters = cloudFactory(project, { plugins });
  const metaModel = metaModelFactory(project, { plugins });
  const hub = hubFactory(project, { plugins });
  const engine = engineFactory({ project, model: metaModel, hub, plugins });

  engine.mutations_.subscribe(metaModel.mutate);
  clusters.snapshot().subscribe(engine.process);
  metaModel.changes.subscribe(engine.process);

  metaModel.query("/").subscribe(model => hub.publish("model:change", model));
}

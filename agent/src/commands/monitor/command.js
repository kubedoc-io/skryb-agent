import { projectLoader } from "../../lib/project.js";
import { metaModelFactory } from "../../lib/metamodel.js";
import { hubFactory } from "../../lib/hub.js";
import { cloudFactory } from "../../lib/cloud.js";
import { engineFactory } from "../../lib/engine.js";

export async function monitor(opts = {}) {
  const project = await projectLoader({ path: opts.project });

  // load all plugins
  const plugins = await project.initPlugins(opts);

  const clusters = cloudFactory(project, { plugins });
  const metaModel = metaModelFactory(project, { plugins });
  const hub = hubFactory(project, { plugins });
  const engine = engineFactory({ project, model: metaModel, hub, plugins });

  engine.mutations_.subscribe(metaModel.mutate);
  metaModel.changes.subscribe(engine.process);

  clusters.monitor().subscribe(engine.process);

  metaModel.query("/").subscribe(model => hub.publish("model:change", model));
}

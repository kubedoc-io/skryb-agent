import { projectLoader } from "../../lib/project.js";
import { metaModelFactory } from "../../lib/metamodel.js";
import { hubFactory } from "../../lib/hub.js";
import { cloudFactory } from "../../lib/cloud.js";
import { engineFactory } from "../../lib/engine.js";

export async function monitor(opts = {}) {
  const project = await projectLoader({ path: opts.project });

  const clusters = cloudFactory(project);
  const metaModel = metaModelFactory(project);
  const hub = hubFactory(project);
  const engine = engineFactory({ project, model: metaModel, hub });

  engine.mutations_.subscribe(metaModel.mutate);
  clusters.monitor().subscribe(engine.process);

  metaModel.query("/").subscribe(model => hub.publish("model:change", model));
}

import { projectLoader } from "../../lib/project.js";
import { metaModelFactory } from "../../lib/metamodel.js";
import { hubFactory } from "../../lib/hub.js";
import { cloudFactory } from "../../lib/cloud.js";
import { engineFactory } from "../../lib/engine.js";
import { apiServer } from "../../lib/api-server.js";

export async function start(opts = {}) {
  const project = await projectLoader({ path: opts.project });

  const metaModel = metaModelFactory(project);
  const engine = engineFactory(project);
  const hub = hubFactory(project);
  const clusters = cloudFactory(project);

  engine.mutations_.subscribe(metaModel.mutate);
  clusters.monitor().subscribe(engine.process);

  metaModel.query("/").subscribe(model => hub.publish("model:change", model));

  // expose the agent rest and websocket api
  apiServer({ project, metaModel, engine, hub, clusters });
}
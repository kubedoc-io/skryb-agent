import { projectLoader, metaModelFactory, hubFactory, cloudFactory, engineFactory, apiServer } from "../../lib/index.js";

export async function start(opts = {}) {
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

  // expose the agent rest and websocket api
  apiServer({ project, metaModel, engine, hub, clusters });
}

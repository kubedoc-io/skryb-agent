import { projectLoader, metaModelFactory, hubFactory, cloudFactory, engineFactory } from "../../lib/index.js";

export async function snapshot(opts = {}) {
  const project = await projectLoader({ path: opts.project });

  // load all plugins
  const plugins = await project.initPlugins(opts);

  const clusters = cloudFactory(project, { plugins });
  const metaModel = metaModelFactory(project, { plugins });
  const hub = hubFactory(project, { plugins });
  const engine = engineFactory({ project, model: metaModel, hub, plugins });

  engine.mutations_.subscribe(metaModel.mutate);
  clusters.snapshot().subscribe(engine.process);
  metaModel.changes.subscribe(engine.process);

  metaModel.query("/").subscribe(model => {
    console.log("persisting model", model);
  });
}

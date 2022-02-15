import express from "express";
import expressWs from "express-ws";
import _ from "lodash";

export function apiServer({ project, metaModel, engine, hub, clusters }) {
  const app = express();
  expressWs(app);

  app.ws("/", function (ws) {
    //TODO: keep a list of all queries and refresh them when the model has changed

    hub.subscribe("model:change", function (model) {
      ws.send("model:change", JSON.stringify(model));
    });
  });

  // register all api routes
  app.get("/model/:section?", function (req, res) {
    const subscription = metaModel.query().subscribe(model => {
      if (req.params.section) {
        res.json(_.get(model, req.params.section));
      } else {
        res.json(model);
      }
    });
    res.on("finish", () => subscription && subscription.unsubscribe());
  });
  //TODO: query
  //TODO: full-text search
  app.get("/search/:type?", async function (req, res) {
    const result = await metaModel.search({ type: req.params.type, ...req.query });
    res.json(result);
  });
  //TODO: force snapshot
  //TODO: force doc site rebuild (publish the model)

  app.listen(_.get(project, "api.port", 15999), function (err) {
    if (err) {
      return console.error(err);
    }
    console.info("skryb agent listening on port", _.get(project, "api.port", 15999));
  });
}

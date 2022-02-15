import FlexSearch from "flexsearch";
import _ from "lodash";

const { Document } = FlexSearch;

export function fullTextIndexer(project) {
  const systemIndex = new Document({
    tokenize: "full",
    optimize: true,
    resolution: 9,
    document: {
      id: "name",
      index: ["summary", "name"]
    }
  });
  const microserviceIndex = new Document({
    tokenize: "full",
    optimize: true,
    resolution: 9,
    document: {
      id: "name",
      index: []
    }
  });
  const resourceIndex = new Document({
    tokenize: "full",
    optimize: true,
    resolution: 9,
    document: {
      id: "name",
      index: []
    }
  });
  const teamIndex = new Document({
    tokenize: "full",
    optimize: true,
    resolution: 9,
    document: {
      id: "name",
      index: []
    }
  });

  return {
    async indexModel(model) {
      try {
        return await Promise.all([
          Promise.all(model.systems.map(sys => systemIndex.addAsync(sys))),
          Promise.all(model.microservices.map(ms => microserviceIndex.addAsync(ms))),
          Promise.all(model.resources.map(r => resourceIndex.addAsync(r))),
          Promise.all(model.teams.map(t => teamIndex.addAsync(t)))
        ]);
      } catch (err) {
        console.error(err);
      }
    },
    async search(query, model) {
      switch (query.type) {
        case "system": {
          const result = await systemIndex.searchAsync(query.expr, query.limit);
          if (result.length > 0) {
            return _.uniq(_.flatten(result.map(({ result }) => model.systems.filter(s => result.indexOf(s.name) !== -1))));
          } else {
            return result;
          }
        }
        case "microservice": {
          const result = await microserviceIndex.searchAsync(query.expr, query.limit);
          if (result.length > 0) {
            return _.uniq(_.flatten(result.map(({ result }) => model.microservices.filter(s => result.indexOf(s.name) !== -1))));
          } else {
            return result;
          }
        }
        case "resources": {
          const result = await resourceIndex.searchAsync(query.expr, query.limit);
          if (result.length > 0) {
            return _.uniq(_.flatten(result.map(({ result }) => model.resources.filter(s => result.indexOf(s.name) !== -1))));
          } else {
            return result;
          }
        }
        case "teams": {
          const result = await teamIndex.searchAsync(query.expr, query.limit);
          if (result.length > 0) {
            return _.uniq(_.flatten(result.map(({ result }) => model.teams.filter(s => result.indexOf(s.name) !== -1))));
          } else {
            return result;
          }
        }
        default:
          return _.flatten(
            await Promise.all([
              { type: "system", result: await systemIndex.searchAsync(query.expr, query.limit) },
              { type: "microservice", result: await microserviceIndex.searchAsync(query.expr, query.limit) },
              { type: "resource", result: await resourceIndex.searchAsync(query.expr, query.limit) },
              { type: "team", result: await teamIndex.searchAsync(query.expr, query.limit) }
            ])
          );
      }
    }
  };
}

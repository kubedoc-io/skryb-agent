import { BehaviorSubject } from "rxjs";
import { produce } from "immer";
import _ from "lodash";
import { fullTextIndexer } from "./flexsearch-indexer.js";

export function memoryModel(project) {
  const state = new BehaviorSubject({
    systems: [],
    microservices: [],
    resources: [],
    teams: []
  });

  const indexer = fullTextIndexer(project);

  // Maintain our full text search indexes
  state.subscribe(indexer.indexModel);

  return {
    select(selector, filter) {
      return state.asObservable();
    },
    query(expr) {
      return state.asObservable();
    },
    async search(query) {
      return indexer.search(query, state.getValue());
    },
    mutate(mutation) {
      console.log("reducing mutation", mutation);
      state.next(
        produce(state.getValue(), draft => {
          switch (mutation.type) {
            case "SET_SYSTEM": {
              const existing = draft.systems.find(s => s.name === mutation.data.name);
              if (existing) {
                _.merge(existing, mutation.data);
              } else {
                draft.systems.push({ ...mutation.data });
              }
              break;
            }
            case "SET_MICROSERVICE": {
              const existing = draft.microservices.find(m => m.name === mutation.data.name);
              if (existing) {
                _.merge(existing, mutation.data);
              } else {
                draft.microservices.push({ ...mutation.data });
              }
            }
          }
        })
      );
    }
  };
}

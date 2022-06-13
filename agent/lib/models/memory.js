import { BehaviorSubject, Subject } from "rxjs";
import { produceWithPatches, enablePatches } from "immer";
import _ from "lodash";
import { fullTextIndexer } from "./flexsearch-indexer.js";

enablePatches();

export function memoryModel(project) {
  const state = new BehaviorSubject({
    systems: [],
    microservices: [],
    resources: [],
    teams: []
  });

  const changes = new Subject();

  const indexer = fullTextIndexer(project);

  // Maintain our full text search indexes
  state.subscribe(indexer.indexModel);

  return {
    changes: changes.asObservable(),
    getSnapshot() {
      return state.getValue();
    },
    select(selector, filter) {
      return state.asObservable();
    },
    query(expr) {
      return state.asObservable();
    },
    async search(query) {
      return indexer.search(query, state.getValue());
    },
    mutate(mutations) {
      if (!Array.isArray(mutations)) {
        mutations = [mutations];
      }
      mutations.map(mutation => {
        const [nextState, patches] = produceWithPatches(state.getValue(), draft => {
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
              break;
            }
            case "SET_RESOURCE": {
              const existing = draft.resources.find(m => m.name === mutation.data.name);
              if (existing) {
                _.merge(existing, mutation.data);
              } else {
                draft.resources.push({ ...mutation.data });
              }
              break;
            }
            case "SET_SOURCECONTROL_INFOS": {
              let target = null;
              switch (mutation.target.type) {
                case "service":
                  target = draft.microservices.find(m => m.name === mutation.target.name);
                  break;
              }
              // find the target micro-service
              if (target) {
                target.scInfos = mutations.infos;
              }
              break;
            }
          }
        });

        if (patches.length > 0) {
          state.next(nextState);
          changes.next({ type: "MODEL", changes: patches });
        }
      });
    }
  };
}

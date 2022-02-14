import { BehaviorSubject } from "rxjs";
import { produce } from "immer";
import _ from "lodash";

export function memoryModel(project) {
  const state = new BehaviorSubject({
    systems: [],
    microservices: [],
    resources: [],
    teams: []
  });

  return {
    query(expr) {
      return state.asObservable();
    },
    mutate(mutation) {
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

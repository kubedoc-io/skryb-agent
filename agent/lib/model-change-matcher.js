import sift from "sift-noget";

export function modelChangeMatcher(criteria) {
  return function (event) {
    if (event.type === "MODEL" && event.changes) {
      return event.changes.filter(sift.default(criteria)).length > 0;
    }
  };
}

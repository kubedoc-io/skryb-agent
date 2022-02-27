import sift from "sift-noget";

export function resourceMatcher(criteria) {
  return function (event) {
    if (event.type !== "MODEL" && event.resource) {
      return sift.default(criteria)(event.resource);
    } else {
      return false;
    }
  };
}

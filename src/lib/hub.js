export function hubFactory(project) {
  return {
    publish(...args) {
      console.log("publishing event", ...args);
    },
    subscribe(channel, observer) {
      return new Observable(function (obs) {});
    }
  };
}

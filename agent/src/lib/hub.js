export function hubFactory(project) {
  return {
    publish(...args) {},
    subscribe(channel, observer) {
      return new Observable(function (obs) {});
    }
  };
}

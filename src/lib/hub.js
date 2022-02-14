export function hubFactory(project) {
  return {
    publish(...args) {
      console.log("publishing event", ...args);
    }
  };
}

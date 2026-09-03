// Minimal reactive store — a tiny pub/sub wrapper around a state object.
// Subscribers register a callback and get notified on any state change via `mutate()`.

export function reactive(initialState) {
  const state = { ...initialState };
  const subscribers = new Set();

  return {
    get: () => state,
    set: (partial) => {
      Object.assign(state, partial);
      subscribers.forEach((fn) => fn(state));
    },
    update: (updater) => {
      const next = updater(state);
      Object.assign(state, next);
      subscribers.forEach((fn) => fn(state));
    },
    subscribe: (fn) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
  };
}

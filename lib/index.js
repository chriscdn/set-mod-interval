// src/index.ts
var setIntervalDynamic = (fn, resolver) => {
  let runCount = -1;
  let tick = -1;
  let timeout = void 0;
  let currentSessionId = 0;
  const funky = async (sessionId) => {
    if (sessionId === currentSessionId) {
      let results = void 0;
      let error;
      try {
        results = await fn();
      } catch (e) {
        error = e;
      }
      runCount++;
      tick++;
      const interval = resolver({
        results,
        runCount,
        error,
        tick,
        resetRunCount,
        cancel
      });
      if (sessionId === currentSessionId) {
        timeout = setTimeout(() => funky(sessionId), interval);
      }
    }
  };
  const cancel = () => {
    currentSessionId++;
    clearTimeout(timeout);
  };
  const restart = (delay = 0) => {
    cancel();
    resetRunCount();
    timeout = setTimeout(() => funky(currentSessionId), delay);
  };
  const resetRunCount = () => {
    runCount = -1;
  };
  restart();
  return { restart, cancel, resetRunCount };
};
export {
  setIntervalDynamic
};
//# sourceMappingURL=index.js.map
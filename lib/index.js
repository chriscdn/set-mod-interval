// src/index.ts
var setIntervalDynamic = (fn, callback, initialDelay = 0) => {
  let runCount = -1;
  let tick = -1;
  let timeout = void 0;
  let currentSessionId = 0;
  let previousResults = void 0;
  const _runIteration = async (sessionId) => {
    if (sessionId === currentSessionId) {
      let results = void 0;
      let error;
      try {
        results = await fn();
      } catch (e) {
        error = e;
      } finally {
        runCount++;
        tick++;
      }
      if (sessionId === currentSessionId) {
        const rawInterval = callback({
          results,
          runCount,
          error,
          tick,
          resetRunCount,
          cancel,
          previousResults
        });
        previousResults = results;
        if (sessionId === currentSessionId) {
          const interval = Number.isFinite(rawInterval) ? Math.max(0, rawInterval) : 0;
          timeout = setTimeout(() => _runIteration(sessionId), interval);
        }
      }
    }
  };
  const cancel = () => {
    currentSessionId++;
    clearTimeout(timeout);
    timeout = void 0;
    previousResults = void 0;
  };
  const restart = (delay = 0) => {
    cancel();
    resetRunCount();
    timeout = setTimeout(() => _runIteration(currentSessionId), delay);
  };
  const resetRunCount = () => {
    runCount = -1;
  };
  restart(initialDelay);
  return { restart, cancel, resetRunCount };
};
export {
  setIntervalDynamic
};
//# sourceMappingURL=index.js.map
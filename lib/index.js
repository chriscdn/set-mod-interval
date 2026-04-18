// src/index.ts
var setIntervalDynamic = (fn, nextInterval) => {
  let runCount = -1;
  let tick = -1;
  let timeout = void 0;
  let currentSessionId = 0;
  const _runIteration = async (sessionId) => {
    if (sessionId === currentSessionId) {
      let results = void 0;
      let error;
      try {
        results = await fn();
      } catch (e) {
        error = e;
      }
      if (sessionId === currentSessionId) {
        runCount++;
        tick++;
        const rawInterval = nextInterval({
          results,
          runCount,
          error,
          tick,
          resetRunCount,
          cancel
        });
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
  };
  const restart = (delay = 0) => {
    cancel();
    resetRunCount();
    timeout = setTimeout(() => _runIteration(currentSessionId), delay);
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
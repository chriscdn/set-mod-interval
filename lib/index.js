// src/index.ts
var setIntervalDynamic = (fn, resolver) => {
  let runCount = -1;
  let tick = -1;
  let cancelled = false;
  let timeout = void 0;
  const funky = async () => {
    if (cancelled) {
    } else {
      let results = void 0;
      let error;
      try {
        results = await fn();
      } catch (e) {
        error = e;
      }
      runCount++;
      tick++;
      const interval = resolver({ results, runCount, error, tick });
      if (cancelled) {
      } else {
        timeout = setTimeout(funky, interval);
      }
    }
  };
  const resetRunCount = () => {
    runCount = -1;
  };
  const cancel = () => {
    resetRunCount();
    cancelled = true;
    clearTimeout(timeout);
  };
  const restart = () => {
    cancel();
    cancelled = false;
    funky();
  };
  resetRunCount();
  funky();
  return { restart, resetRunCount, cancel };
};
export {
  setIntervalDynamic
};
//# sourceMappingURL=index.js.map
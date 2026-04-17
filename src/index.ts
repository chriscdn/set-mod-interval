/**
 * A `setInterval` alternative that recalculates delay after each run.
 *
 * @param fn - The function to call on each iteration.
 * @param resolver - A callback to determine the delay (in ms) before the next iteration.
 * Receives the current 0-based iteration index and the results of `fn`.
 * @returns Controls to manage the interval: `cancel`, `reset`, and `restart`.
 */
const setIntervalDynamic = <T extends (...args: any[]) => any>(
  fn: T,
  resolver: (options: {
    /** The 0-based index of the current iteration. */
    runCount: number;
    /** The 0-based index of the overall iteration. */
    tick: number;
    /** The resolved value of the `fn` call for this iteration. */
    results: ReturnType<T> | undefined;
    /** The error caught if `fn` rejected/threw. */
    error: unknown;
  }) => number,
) => {
  let runCount = -1;
  let tick = -1;
  let cancelled = false;
  let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

  const funky = async () => {
    if (cancelled) {
      // do nothing
    } else {
      let results: ReturnType<T> | undefined = undefined;
      let error: unknown;

      try {
        results = await fn();
      } catch (e) {
        error = e;
      }

      // iteration is 0 on the first run, 1 on the second, etc.
      runCount++;
      tick++;
      const interval = resolver({ results, runCount, error, tick });

      if (cancelled) {
        // do nothing
      } else {
        timeout = setTimeout(funky, interval);
      }
    }
  };

  /** Resets the runCount counter to 0 without stopping the current cycle. */
  const resetRunCount = () => {
    runCount = -1;
  };

  /** Stops the interval immediately and clears any pending timeout. */
  const cancel = () => {
    resetRunCount();
    cancelled = true;
    clearTimeout(timeout);
  };

  /**
   * Resets the counter and restarts the execution loop. This will execute the
   * callback (almost) immediately. Useful for manual retries after a manual
   * cancellation.
   */
  const restart = () => {
    cancel(); // Ensures we don't have multiple loops running
    cancelled = false;
    funky();
  };

  // get the ball rolling
  resetRunCount();
  funky();

  return { restart, resetRunCount, cancel };
};

export { setIntervalDynamic };

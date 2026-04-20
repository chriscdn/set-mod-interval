/**
 * A `setInterval` alternative that recalculates the delay after each execution
 * and provides lifecycle controls directly within the iteration logic.
 *
 * This utility is ideal for polling, exponential backoff, or tasks where the
 * next interval depends on the outcome of the current execution.
 *
 * @param fn - The asynchronous or synchronous function to execute on each iteration.
 * @param callback - A callback triggered after `fn` settles. It determines the
 * delay (in ms) before the next iteration starts and provides controls to
 * manipulate the state.
 * @param {number} [initialDelay] - How many milliseconds to start before the first call. Default is 0.
 *
 * @returns An object containing:
 * - `cancel`: Stops the execution loop and clears pending timeouts.
 * - `restart`: Resets the session, clears counts, and starts the loop again.
 * - `resetRunCount`: Sets the `runCount` back to -1 (the next iteration will be 0).
 */
const setIntervalDynamic = <T extends (...args: any[]) => any>(
  fn: T,
  callback: (context: {
    // The 0-based index of iterations since the last reset or restart.
    runCount: number;

    // The 0-based index of total iterations since the initial call, which is never reset.
    tick: number;

    // The resolved value of the `fn` call for this iteration.
    results: Awaited<ReturnType<T>> | undefined;

    // The results from the previous iteration. Undefined on first call.
    previousResults: Awaited<ReturnType<T>> | undefined;

    // The error if `fn` rejects or throws.
    error: unknown;

    // Resets the `runCount`. Useful for logic that relies on incremental
    // backoff or retry limits.
    resetRunCount: () => void;

    // Terminate the loop. No further timeouts will be scheduled
    // after this is called. Can be restarted with `restart()`.
    cancel: () => void;
  }) => number,
  initialDelay = 0,
) => {
  // Tracks iterations for the current "session"; reset by `resetRunCount`.
  let runCount = -1;

  // Tracks lifetime iterations of the instance; never reset.
  let tick = -1;

  // Reference to the active `setTimeout` to allow for cleanup.
  let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

  // Incremented on every restart/cancel to invalidate previous asynchronous
  // execution chains (race condition protection).
  let currentSessionId = 0;

  let previousResults: Awaited<ReturnType<T>> | undefined = undefined;

  // The core execution wrapper that handles the function call, error catching,
  // and scheduling the next iteration.
  const _runIteration = async (sessionId: number) => {
    // Prevent execution if the session was invalidated (cancelled or restarted)
    if (sessionId === currentSessionId) {
      let results: Awaited<ReturnType<T>> | undefined = undefined;
      let error: unknown;

      try {
        results = await fn();
      } catch (e) {
        error = e;
      } finally {
        runCount++;
        tick++;
      }

      // Handles the case of `cancel` being called during or in the `await fn()`
      // call.
      if (sessionId === currentSessionId) {
        // Increment counters after fn() completes

        // Calculate the delay for the next run based on current state.
        const rawInterval = callback({
          results,
          runCount,
          error,
          tick,
          resetRunCount,
          cancel,
          previousResults,
        });

        previousResults = results;

        // Handles the case of `cancel` being called during the `callback()` call.
        if (sessionId === currentSessionId) {
          const interval = Number.isFinite(rawInterval)
            ? Math.max(0, rawInterval)
            : 0;

          timeout = setTimeout(() => _runIteration(sessionId), interval);
        }
      }
    }
  };

  // Stops the interval immediately, invalidates the current session, and clears
  // any pending timeout.
  const cancel = () => {
    currentSessionId++;
    clearTimeout(timeout);
    timeout = undefined;
    previousResults = undefined;
  };

  /**
   * Fully resets the interval state (session and runCount) and initiates a
   * fresh execution loop after an optional delay.
   *
   * @param {number} delay - Time to wait (in ms) before the first execution of
   * the new session.
   */
  const restart = (delay: number = 0) => {
    cancel();
    resetRunCount();
    timeout = setTimeout(() => _runIteration(currentSessionId), delay);
  };

  // Resets the runCount to -1 so the next iteration starts at 0.
  const resetRunCount = () => {
    runCount = -1;
  };

  restart(initialDelay);

  return { restart, cancel, resetRunCount };
};

export { setIntervalDynamic };

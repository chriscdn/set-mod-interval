/**
 * A `setInterval` alternative that recalculates the delay after each execution
 * and provides lifecycle controls directly within the iteration logic.
 *
 * This utility is ideal for polling, exponential backoff, or tasks where the
 * next interval depends on the outcome of the current execution.
 *
 * @param fn - The asynchronous or synchronous function to execute on each iteration.
 * @param resolver - A callback triggered after `fn` settles. It determines the
 * delay (in ms) before the next iteration starts and provides controls to
 * manipulate the loop state.
 * * @returns An object containing:
 * - `cancel`: Stops the execution loop and clears pending timeouts.
 * - `restart`: Resets the session, clears counts, and starts the loop again.
 * - `resetRunCount`: Sets the `runCount` back to -1 (the next iteration will be 0).
 */
const setIntervalDynamic = <T extends (...args: any[]) => any>(
  fn: T,
  resolver: (options: {
    /** The 0-based index of iterations since the last reset or restart. */
    runCount: number;
    /** The 0-based index of total iterations since the initial call. */
    tick: number;
    /** The resolved value of the `fn` call for this iteration. */
    results: ReturnType<T> | undefined;
    /** The error caught if `fn` rejected or threw. */
    error: unknown;
    /** * Resets the `runCount` to -1. Useful for logic that relies on
     * incremental backoff or retry limits.
     */
    resetRunCount: () => void;
    /** * Immediately terminates the loop. No further timeouts will be
     * scheduled after this is called.
     */
    cancel: () => void;
  }) => number,
) => {
  /** Tracks iterations for the current "session"; reset by `resetRunCount`. */
  let runCount = -1;
  /** Tracks lifetime iterations of the instance; never reset. */
  let tick = -1;

  /** Reference to the active `setTimeout` to allow for cleanup. */
  let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

  /** * Incremented on every restart/cancel to invalidate previous
   * asynchronous execution chains (race condition protection).
   */
  let currentSessionId = 0;

  /**
   * The core execution wrapper that handles the function call,
   * error catching, and scheduling the next iteration.
   */
  const funky = async (sessionId: number) => {
    // Prevent execution if the session was invalidated (cancelled or restarted)
    if (sessionId === currentSessionId) {
      let results: ReturnType<T> | undefined = undefined;
      let error: unknown;

      try {
        results = await fn();
      } catch (e) {
        error = e;
      }

      // Increment counters after fn() completes
      runCount++;
      tick++;

      /** Calculate the delay for the next run based on current state. */
      const interval = resolver({
        results,
        runCount,
        error,
        tick,
        resetRunCount,
        cancel,
      });

      // Final check: ensure the session is still valid before scheduling the next tick
      if (sessionId === currentSessionId) {
        timeout = setTimeout(() => funky(sessionId), interval);
      }
    }
  };

  /** * Stops the interval immediately, invalidates the current session,
   * and clears any pending timeout.
   */
  const cancel = () => {
    currentSessionId++;
    clearTimeout(timeout);
  };

  /**
   * Fully resets the interval state (session and runCount) and initiates
   * a fresh execution loop after an optional delay.
   * * @param delay - Time to wait (in ms) before the first execution of the new session.
   */
  const restart = (delay: number = 0) => {
    cancel();
    resetRunCount();
    timeout = setTimeout(() => funky(currentSessionId), delay);
  };

  /** Resets the runCount to -1 so the next iteration starts at 0. */
  const resetRunCount = () => {
    runCount = -1;
  };

  // Automatic initial kick-off
  restart();

  return { restart, cancel, resetRunCount };
};

export { setIntervalDynamic };

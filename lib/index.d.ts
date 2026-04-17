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
declare const setIntervalDynamic: <T extends (...args: any[]) => any>(fn: T, resolver: (options: {
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
}) => number) => {
    restart: (delay?: number) => void;
    cancel: () => void;
    resetRunCount: () => void;
};

export { setIntervalDynamic };

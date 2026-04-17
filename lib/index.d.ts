/**
 * A `setInterval` alternative that recalculates delay after each run.
 *
 * @param fn - The function to call on each iteration.
 * @param resolver - A callback to determine the delay (in ms) before the next iteration.
 * Receives the current 0-based iteration index and the results of `fn`.
 * @returns Controls to manage the interval: `cancel`, `reset`, and `restart`.
 */
declare const setIntervalDynamic: <T extends (...args: any[]) => any>(fn: T, resolver: (options: {
    /** The 0-based index of the current iteration. */
    runCount: number;
    /** The 0-based index of the overall iteration. */
    tick: number;
    /** The resolved value of the `fn` call for this iteration. */
    results: ReturnType<T> | undefined;
    /** The error caught if `fn` rejected/threw. */
    error: unknown;
}) => number) => {
    restart: () => void;
    resetRunCount: () => void;
    cancel: () => void;
};

export { setIntervalDynamic };

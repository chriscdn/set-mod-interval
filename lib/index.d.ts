/**
 * A `setInterval` alternative that recalculates the delay after each execution
 * and provides lifecycle controls directly within the iteration logic.
 *
 * This utility is ideal for polling, exponential backoff, or tasks where the
 * next interval depends on the outcome of the current execution.
 *
 * @param fn - The asynchronous or synchronous function to execute on each iteration.
 * @param nextInterval - A callback triggered after `fn` settles. It determines the
 * delay (in ms) before the next iteration starts and provides controls to
 * manipulate the loop state.
 *
 * @returns An object containing:
 * - `cancel`: Stops the execution loop and clears pending timeouts.
 * - `restart`: Resets the session, clears counts, and starts the loop again.
 * - `resetRunCount`: Sets the `runCount` back to -1 (the next iteration will be 0).
 */
declare const setIntervalDynamic: <T extends (...args: any[]) => any>(fn: T, nextInterval: (context: {
    runCount: number;
    tick: number;
    results: Awaited<ReturnType<T>> | undefined;
    error: unknown;
    resetRunCount: () => void;
    cancel: () => void;
}) => number) => {
    restart: (delay?: number) => void;
    cancel: () => void;
    resetRunCount: () => void;
};

export { setIntervalDynamic };

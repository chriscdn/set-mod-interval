# @chriscdn/dynamic-interval

A `setInterval` alternative that recalculates the delay after each run based on execution results. It provides fine-grained control over the loop's lifecycle, making it perfect for polling, exponential backoff, and state-dependent scheduling.

## Installing

Using npm:

```bash
npm install @chriscdn/dynamic-interval
```

Using yarn:

```bash
yarn add @chriscdn/dynamic-interval
```

## Usage

```ts
import { setIntervalDynamic } from "@chriscdn/dynamic-interval";
```

### Example: Finite Polling

Stop the interval automatically once a specific condition is met.

```ts
setIntervalDynamic(
  async () => {
    const response = await fetch("/api/job-status");
    return response.json();
  },
  ({ results, cancel }) => {
    if (results?.status === "completed") {
      console.log("Job done!");
      cancel(); // Stop the loop
      return 0;
    } else {
      // Otherwise, check again in 2 seconds
      return 2000;
    }
  },
);
```

### Example: Exponential Backoff

Increase the delay when an async operation fails. On success, `resetRunCount()` is used to return to the base frequency.

```ts
const { resetRunCount } = setIntervalDynamic(
  async () => fetch("/api/data"),
  ({ runCount, error, resetRunCount }) => {
    if (error) {
      // Exponential backoff: 2s, 4s, 8s... capped at 30s
      return Math.min(1000 * 2 ** runCount, 30_000);
    } else {
      // Reset the runCount so the next error starts back at 2s
      resetRunCount();
      return 1000; // Poll every 1s on success
    }
  },
);
```

## API

### `setIntervalDynamic(fn, resolver)`

| Parameter  | Type                                   | Description                                 |
| ---------- | -------------------------------------- | ------------------------------------------- |
| `fn`       | `() => any`                            | The function to execute. Can be async.      |
| `resolver` | `(options: ResolverOptions) => number` | Callback to determine the next delay in ms. |

#### Resolver Options Object

The `resolver` callback receives an object with the following properties:

- **`runCount`**: `number` — 0-based index of the current cycle. Resets to 0 when `resetRunCount()` or `restart()` is called.
- **`tick`**: `number` — 0-based index of total cycles since instantiation. This never resets.
- **`results`**: `ReturnType<fn> | undefined` — The value returned/resolved by the latest `fn` call.
- **`error`**: `unknown` — The error caught if `fn` threw or rejected.
- **`cancel`**: `() => void` — Call this to stop the interval immediately.
- **`resetRunCount`**: `() => void` — Call this to reset the `runCount` to 0.

### Returns

The function returns a controller object to manage the interval from the outside:

- **`cancel()`**: Stops the interval immediately and clears any pending timeouts.
- **`restart(delay?: number)`**: Stops the current interval, resets the `runCount`, and schedules a new session. Defaults to an immediate start (`0`ms).
- **`resetRunCount()`**: Resets the `runCount` counter.

## License

[MIT](LICENSE)

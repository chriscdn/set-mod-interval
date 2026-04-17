# @chriscdn/dynamic-interval

A `setInterval` alternative that recalculates delay after each run. Includes functions to cancel and restart.

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

### Example with array mapping

Using 0-based indexing to pull delays from a predefined sequence.

```ts
const { cancel } = setIntervalDynamic(
  () => console.log("Action performed"),
  ({ runCount }) => {
    const delays = [500, 1000, 2000, 5000];
    return delays[runCount] ?? 10000;
  },
);
```

### Example with exponential backoff

The delay only increases when an async operation fails. On success, `resetRunCount()` is called to reset the delay back to its starting value.

```ts
const { resetRunCount } = setIntervalDynamic(
  async () => fetch("/api/data"),
  ({ runCount, error }) => {
    if (error) {
      // Exponential backoff: 2s, 4s, 8s... capped at 30s
      return Math.min(1000 * 2 ** runCount, 30_000);
    } else {
      resetRunCount();

      // 1s delay on success
      return 1000;
    }
  },
);
```

## API

### `setIntervalDynamic(fn, resolver)`

| Parameter  | Type                                           | Description                                 |
| ---------- | ---------------------------------------------- | ------------------------------------------- |
| `fn`       | `() => any`                                    | The function to execute. Can be async.      |
| `resolver` | `({runCount, tick, results, error}) => number` | Callback to determine the next delay in ms. |

#### Resolver Data Object

The `resolver` callback receives:

- `runCount`: (number) The 0-based index of the current cycle, resets when `resetRunCount()` is called.
- `tick`: (number) The 0-based index of the current cycle, never resets.
- `results`: (any) The return value of the latest `fn` call.
- `error`: (any) The error caught if `fn` threw/rejected.

### Returns

- `cancel()`: Stops the interval and clears any pending timeouts.
- `restart()`: Clears the interval, resets the counter, and starts immediately. Does not modify `tick`.
- `resetRunCount()`: Resets the `runCount` counter to 0.

## License

[MIT](LICENSE)

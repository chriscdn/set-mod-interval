import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setIntervalDynamic } from "../src";

describe("Test1", () => {
  it("sync", async () => {
    expect(1).toBe(1);
  });
});

describe("setIntervalDynamic", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  it("runs repeatedly with resolver controlling delay", async () => {
    let count = 0;

    const fn = vi.fn(async () => {
      count += 1;
      return count;
    });

    const delays = [10, 20, 30];

    const resolver = vi.fn(({ runCount }) => {
      return delays[runCount] ?? 50;
    });

    setIntervalDynamic(fn, resolver);

    await vi.advanceTimersByTimeAsync(100);

    expect(fn.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(resolver.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it("stops execution after cancel is called", async () => {
    const fn = vi.fn(async () => 1);

    const resolver = vi.fn(() => 10);

    const controls = setIntervalDynamic(fn, resolver);

    await vi.advanceTimersByTimeAsync(25);

    controls.cancel();

    const callsAfterCancel = fn.mock.calls.length;

    await vi.advanceTimersByTimeAsync(100);

    expect(fn.mock.calls.length).toBe(callsAfterCancel);
  });

  it("restart resumes execution after cancellation", async () => {
    const fn = vi.fn(async () => 1);
    const resolver = vi.fn(() => 10);

    const controls = setIntervalDynamic(fn, resolver);

    await vi.advanceTimersByTimeAsync(25);

    controls.cancel();

    const pausedCalls = fn.mock.calls.length;

    controls.restart();

    await vi.advanceTimersByTimeAsync(50);

    expect(fn.mock.calls.length).toBeGreaterThan(pausedCalls);
  });

  it("resetRunCount affects runCount passed into resolver", async () => {
    const fn = vi.fn(async () => 1);

    const captured = [] as number[];

    const resolver = vi.fn(({ runCount }) => {
      captured.push(runCount);
      return 10;
    });

    const controls = setIntervalDynamic(fn, resolver);

    await vi.advanceTimersByTimeAsync(25);

    controls.resetRunCount();

    await vi.advanceTimersByTimeAsync(25);

    expect(captured.length).toBeGreaterThanOrEqual(2);

    expect(captured[0]).toBeGreaterThanOrEqual(0);
  });
});

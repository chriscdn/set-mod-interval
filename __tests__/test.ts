import { setIntervalDynamic } from "../src";

let lastD = Date.now();

const { cancel, restart } = setIntervalDynamic(
  async () => {
    const now = Date.now();
    const z = now - lastD;
    lastD = now;
    return 777;
    // console.log(`hello : ${z}`);
  },
  ({ runCount, results }) => {
    console.log(`----- runCount: ${runCount} `);
    const delays = [1000, 1000, 5_000, 10_000];
    const delay = delays[runCount] ?? 20_000;

    if (delay === 5000) {
      console.log("restart");
      restart(delay);
    }

    console.log(`Waiting: ${delay}ms until next run.`);
    console.log(`iteration: ${runCount}`);

    return delay;
  },
);

// setTimeout(restart, 10_000);

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const func1 = async () => {
  void Promise.resolve().then(async () => {
    const test = await pause(1000);
    console.log("func1");
  });
};

const func2 = async () => {
  await pause(500);
  void Promise.resolve().then(() => {
    console.log("func2");
  });
};

func1();
func2();

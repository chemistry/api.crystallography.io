import { app, AppContext } from "./app";
import { getLogger } from "./common/logger";

const getContext = async (): Promise<AppContext> => {
    const logger = await getLogger();

    return {
        logger,
        sendMessagesToQueue: (data: object[]): void => {
            console.log("sendMessagesToQueue");
        },
    };
};

const main = async () => {
    const context = await getContext();

    // tslint:disable-next-line
    console.time("application start");
    await app(context);

    // tslint:disable-next-line
    console.timeEnd("application start");
};

main().catch((e) => {
    // tslint:disable-next-line
    console.error(e);
    process.exit(-1);
});

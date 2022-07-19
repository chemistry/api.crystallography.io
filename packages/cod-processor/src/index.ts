import { app, AppContext, CodFileRecord } from "./app";
import { getSubscriptionChanel } from "./common/azure-service-buss-subscription";
import { getLogger } from "./common/logger";

const QUEUE_NAME = "COD_FILES_CHANGED";

const getContext = async (): Promise<AppContext> => {
    const logger = await getLogger();
    const { subscribe } = await getSubscriptionChanel<CodFileRecord>(
        QUEUE_NAME
    );

    process.on("exit", (code) => {
        // tslint:disable-next-line
        console.log(`About to exit with code: ${code}`);
    });

    return {
        logger,
        subscribe,
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

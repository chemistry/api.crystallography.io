import { getSender } from "./common/azure-service-buss-q-sender";
import { app, AppContext } from "./app";
import { getLogger } from "./common/logger";
import { getTableLogger } from "./common/azure-log-to-table";

const getContext = async (): Promise<AppContext> => {
    const logger = await getLogger();
    const { sendMessages } = await getSender();
    const { logToTable } = await getTableLogger();

    return {
        logger,
        logToTable,
        sendMessages,
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

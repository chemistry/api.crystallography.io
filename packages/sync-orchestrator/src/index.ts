import { app, AppContext } from "./app";
import { getTableClient } from "./common/azure-table-storage";
import { getLogger } from "./common/logger";

const getContext = async (): Promise<AppContext> => {
    const logger = await getLogger();
    const { client } = await getTableClient("synclogs");

    return {
        logger,
        client,
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

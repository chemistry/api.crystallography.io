import * as cron from "node-cron";
import { startDummyServer } from "./common/dummy-server";

export interface AppContext {
    logger: {
        log: (message: string) => void;
        error: (message: string) => void;
    };
    sendMessagesToQueue: (data: object[]) => void;
}

export const app = async (context: AppContext) => {
    const { logger } = context;
    cron.schedule("00 45 */1 * * *", () => {
        logger.log("cron executed");
    });
    await startDummyServer();
};

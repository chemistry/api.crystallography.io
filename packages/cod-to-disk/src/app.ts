import { v4 as uuid } from "uuid";
import * as cron from "node-cron";
import { ExecOptions, ShellString } from "shelljs";
import { Readable } from "stream";
import { startDummyServer } from "./common/dummy-server";
import { getMessageProcessor } from "./process";

export interface MessageInfo {
    correlationId: string;
}

export type messageProcessor<T> = (message: T) => Promise<void>;
export interface AppContext {
    logger: {
        log: (message: string) => void;
        error: (message: string) => void;
    };
    exec: (
        command: string,
        options?: ExecOptions & { async?: false }
    ) => ShellString;
    execAsync: (command: string) => Readable;
    sendMessagesToQueue: (
        data: object[],
        correlationId?: string
    ) => Promise<void>;
}

export const app = async (context: AppContext) => {
    const { logger } = context;

    const processor = await getMessageProcessor(context);

    cron.schedule("00 45 */1 * * *", async () => {
        logger.log("Running cron job");
        await processor({ correlationId: uuid() });
        logger.log("Finished cron job");
    });

    logger.log(`subscribed cron events`);

    await startDummyServer();

    await processor({ correlationId: uuid() });
};

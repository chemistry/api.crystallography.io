import * as cron from "node-cron";
import { TableClient } from "@azure/data-tables";
import { startDummyServer } from "./common/dummy-server";

export interface AppContext {
    logger: {
        log: (message: string) => void;
        error: (message: string) => void;
    };
    client: TableClient;
}

const MESSAGES_LENGTH = 100;
let messages: string[] = [];

export const app = async (context: AppContext) => {
    const { logger, client } = context;

    const saveIntoToLogs = async ({message, task}: { message: string, task: string } ) => {
        messages.unshift(message);
        if (messages.length > MESSAGES_LENGTH) {
            messages = messages.slice(0, MESSAGES_LENGTH);
        }

        await client.createEntity({
            partitionKey: "P1",
            rowKey: `${Date.now()}`,
            task,
            message,
        });
    };

    cron.schedule("00 45 */1 * * *", async () => {
        await saveIntoToLogs({ task: "cod-to-disk",  message: "task started" });
    });
    await startDummyServer({
        info: () => {
            return `<pre>${messages.join("<br/>")}</pre>`;
        },
    });
};

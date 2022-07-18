import * as cron from "node-cron";
import { TableClient } from "@azure/data-tables";
import { startDummyServer } from "./common/dummy-server";

export interface AppContext {
    logger: {
        log: (message: string) => void;
        error: (message: string) => void;
    };
    client: TableClient;
    sendMessages: (queueName: string, messages: any[]) => Promise<void>;
}

const MESSAGES_LENGTH = 100;
let messages: string[] = [];

const scheduleCodToDiskQueue = process.env.SCHEDULE_COD_TO_DISK_QUEUE || "";

const schedule = [
    {
        // every 45 min - run cod to disc sync
        cronTime: "00 45 */1 * * *",
        task: "schedule-cod-to-disk",
        queue: scheduleCodToDiskQueue,
    },
];

export const app = async (context: AppContext) => {
    const { logger, client, sendMessages } = context;

    const saveIntoToLogs = async ({
        message,
        task,
    }: {
        message: string;
        task: string;
    }) => {
        messages.unshift(`${task}: ${message}`);
        if (messages.length > MESSAGES_LENGTH) {
            messages = messages.slice(0, MESSAGES_LENGTH);
        }

        await client.createEntity({
            partitionKey: task,
            rowKey: `${Date.now()}`,
            message,
        });
    };

    schedule.forEach(async ({ cronTime, task, queue }) => {
        cron.schedule(cronTime, async () => {
            const message = "task started";
            const start = Date.now();

            // send message action queue
            await sendMessages(queue, [
                {
                    task,
                    message,
                },
            ]);

            // send information to logs
            await saveIntoToLogs({
                task,
                message,
            });
        });
    });

    await startDummyServer({
        info: () => {
            return `<pre>${messages.join("<br/>")}</pre>`;
        },
    });
};

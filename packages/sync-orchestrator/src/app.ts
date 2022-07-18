import * as cron from "node-cron";
import { v4 as uuid } from "uuid";
import { TableClient } from "@azure/data-tables";
import { startDummyServer } from "./common/dummy-server";
import { ServiceBusMessage } from "@azure/service-bus";

export interface AppContext {
    logger: {
        log: (message: string) => void;
        error: (message: string) => void;
    };
    client: TableClient;
    sendMessages: (
        queueName: string,
        messages: ServiceBusMessage[]
    ) => Promise<void>;
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
        correlationId,
    }: {
        message: string;
        task: string;
        correlationId: string;
    }) => {
        messages.unshift(`${task}: ${correlationId} - ${message}`);
        if (messages.length > MESSAGES_LENGTH) {
            messages = messages.slice(0, MESSAGES_LENGTH);
        }
        logger.log(`${task}: ${correlationId} - ${message}`);

        await client.createEntity({
            rowKey: correlationId,
            partitionKey: task,
            message,
        });
    };

    schedule.forEach(async ({ cronTime, task, queue }) => {
        cron.schedule(cronTime, async () => {
            const message = "task started";
            const correlationId = uuid();

            // send message action queue
            await sendMessages(queue, [
                {
                    body: { task, message },
                    correlationId,
                },
            ]);

            // send information to logs
            await saveIntoToLogs({
                task,
                message,
                correlationId,
            });
        });
    });

    await startDummyServer({
        info: () => {
            return `<pre>${messages.join("<br/>")}</pre>`;
        },
    });
};

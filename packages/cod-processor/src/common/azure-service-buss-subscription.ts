import {
    ProcessErrorArgs,
    ServiceBusClient,
    ServiceBusReceivedMessage,
} from "@azure/service-bus";
import { messageProcessor } from "src/app";

export interface CodFileRecord {
    fileName: string;
    codId: string;
}

export const getSubscriptionChanel = async (queueName: string) => {
    const connectionString = process.env.SERVICEBUS_CONNECTION_STRING || "";
    const sbClient = new ServiceBusClient(connectionString);
    const receiver = sbClient.createReceiver(queueName, {
        receiveMode: "peekLock",
    });

    process.on("SIGTERM", () => {
        sbClient.close();
        receiver.close();
    });

    const processError = async (args: ProcessErrorArgs) => {
        console.log(
            `>>>>> Error from error source ${args.errorSource} occurred: `,
            args.error
        );
    };

    return {
        subscribe: async (processMessage: messageProcessor) => {
            const { close } = await receiver.subscribe({
                processMessage: async (message: ServiceBusReceivedMessage) => {
                    const messageBody: CodFileRecord = message.body;
                    await processMessage(messageBody);
                },
                processError,
            });

            process.on("SIGTERM", close);
        },
    };
};

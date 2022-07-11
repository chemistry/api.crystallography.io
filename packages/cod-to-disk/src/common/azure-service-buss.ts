import { ServiceBusClient, ServiceBusMessage } from "@azure/service-bus";

export const getChanel = async (queueName: string) => {
    /*
        const sender = {
            sendMessages: (_: ServiceBusMessage[]) => Promise.resolve(),
        };
    */
    const connectionString = process.env.SERVICEBUS_CONNECTION_STRING || "";
    const sbClient = new ServiceBusClient(connectionString);
    const sender = sbClient.createSender(queueName);

    process.on("SIGTERM", () => {
        sbClient.close();
        sender.close();
    });

    return {
        sendMessages: (messages: ServiceBusMessage[]) =>
            sender.sendMessages(messages),
    };
};

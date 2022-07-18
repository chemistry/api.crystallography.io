import { ServiceBusClient, ServiceBusMessage } from "@azure/service-bus";

export const getSender = async () => {
    const connectionString = process.env.SERVICEBUS_CONNECTION_STRING || "";
    const sbClient = new ServiceBusClient(connectionString);

    process.on("SIGTERM", () => {
        sbClient.close();
    });

    return {
        sendMessages: async (
            queueName: string,
            messages: ServiceBusMessage[]
        ) => {
            const sender = await sbClient.createSender(queueName);
            await sender.sendMessages(messages);
            await sender.close();
        },
    };
};

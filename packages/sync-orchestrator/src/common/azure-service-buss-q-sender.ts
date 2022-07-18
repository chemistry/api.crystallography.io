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
            const messagesToSend = messages.map((message) => ({
                body: message,
            }));
            await sender.sendMessages(messagesToSend);
            await sender.close();
        },
    };
};

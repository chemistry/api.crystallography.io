import { ExecOptions, ShellString } from "shelljs";
import { Readable } from "stream";
import { messageProcessor } from "./common/azure-service-buss-subscription";
import { startDummyServer } from "./common/dummy-server";
import { getMessageProcessor } from "./process";

export interface QueueMessage {
    correlationId: string;
}
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
    subscribe: (fn: messageProcessor<QueueMessage>) => Promise<void>;
}

export const app = async (context: AppContext) => {
    const { logger, subscribe } = context;

    const processor = await getMessageProcessor(context);

    await subscribe(processor);

    logger.log(`subscribed to event buss`);

    await startDummyServer();
};

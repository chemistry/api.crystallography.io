import { startDummyServer } from "./common/dummy-server";
import { getMessageProcessor } from "./process";

export interface CodFileRecord {
    fileName: string;
    codId: string;
}

export type messageProcessor = (message: CodFileRecord) => Promise<void>;
export interface AppContext {
    logger: {
        log: (message: string) => void;
        error: (message: string) => void;
    };
    subscribe: (fn: messageProcessor) => Promise<void>;
}

export const app = async (context: AppContext) => {
    const { logger, subscribe } = context;

    const processor = await getMessageProcessor(context);

    await subscribe(processor);

    logger.log(`subscribed event buss`);

    await startDummyServer();
};

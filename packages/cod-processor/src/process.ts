import { AppContext, messageProcessor } from "./app";

export interface CodFileRecord {
    fileName: string;
    codId: string;
}

export const getMessageProcessor = (context: AppContext): messageProcessor => {
    return async ({ fileName, codId }: { fileName: string; codId: string }) => {
        console.log(`Processing ${fileName} ${codId}`);
    };
};

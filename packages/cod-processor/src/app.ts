import * as path from "path";
import * as fs from "fs";
import express from "express";
import { ExecOptions, ShellString } from "shelljs";
import { Readable, Transform, TransformCallback, Writable } from "stream";

export interface AppContext {
    logger: {
        log: (message: string) => void;
        error: (message: string) => void;
        trace: (message: string) => void;
    };
    exec: (
        command: string,
        options?: ExecOptions & { async?: false }
    ) => ShellString;
    execAsync: (command: string) => Readable;
    sendMessagesToQueue: (data: object[]) => Promise<void>;
}

export interface CodFileRecord {
    fileName: string;
    codId: string;
}

export const app = async (context: AppContext) => {
    const { logger } = context;

    const startServer = () => {
        new Promise<void>((resolve) => {
            const api = express();

            api.get("/", (_, res) => {
                res.send("");
            });
            api.listen(8080, resolve);
        });
    };

    logger.log(`subscribed cron events`);

    await startServer();
};

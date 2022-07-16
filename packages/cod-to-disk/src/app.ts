import * as path from "path";
import * as fs from "fs";
import * as cron from "node-cron";
import BatchStream from "batch-stream";
import { ExecOptions, ShellString } from "shelljs";
import { Readable, Transform, TransformCallback, Writable } from "stream";
import { startDummyServer } from "./common/dummy-server";

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
    sendMessagesToQueue: (data: object[]) => Promise<void>;
}

export interface CodFileRecord {
    fileName: string;
    codId: string;
}

const DATA_PATH = "/data/cif";
const FILE_REGEX = /^(([\w\d.\/]+\/(\d+)\.cif))$/i;

const extractFileNames = new Transform({
    objectMode: true,
    transform: (
        chunk: Buffer,
        encoding: BufferEncoding,
        callback: TransformCallback
    ) => {
        const lines = chunk
            .toString("utf8")
            .split("\n")
            .map((line) => {
                const matches = FILE_REGEX.exec(line);
                if (matches) {
                    return {
                        fileName: path.resolve(DATA_PATH, matches[2]),
                        codId: matches[3],
                    };
                }
            })
            .filter((item) => {
                return !!item;
            });
        callback(null, lines);
    },
});

let count = 0;
const REPORT_COUNT = 1000;
const sendInfoToConsole = () =>
    new Writable({
        objectMode: true,
        write: (chunk, _encoding, done) => {
            count += chunk.length;
            console.log(`${JSON.stringify(chunk)}`);
            done();
        },
    });

const batch = new BatchStream({ size: 10 });

const getSendInfoToQueue = ({ sendMessagesToQueue }: AppContext) => {
    return new Writable({
        objectMode: true,
        write: async (chunks, _encoding, done) => {
            if (chunks && chunks.length > 0) {
                const messages: any = [];
                chunks.forEach((items: any) => {
                    messages.push(...items);
                });
                count += messages.length;
                if (count % REPORT_COUNT === 0 && count > 0) {
                    console.log(`${count} files processed`);
                }
                if (messages.length > 0) {
                    await sendMessagesToQueue(messages);
                }
            }
            done();
        },
    });
};

const fetchDataFromCod = ({ logger, execAsync }: AppContext): Readable => {
    const isFirstStart = !fs.existsSync(DATA_PATH);
    const cmd = `rsync -av --delete rsync://www.crystallography.net/cif ${DATA_PATH}`;
    if (isFirstStart) {
        logger.log("First start: initial fetching data...");
        return execAsync(cmd);
    }

    logger.log("Update via RSYNC...");
    return execAsync(cmd);
};

const synchronizeData = (context: AppContext) => {
    const { logger } = context;

    return new Promise<void>((resolve) => {
        fetchDataFromCod(context)
            .pipe(extractFileNames)
            .pipe(batch)
            .pipe(getSendInfoToQueue(context))
            .on("error", (e) => {
                logger.error(String(e));
            })
            .on("end", () => {
                resolve();
            });
    });
};

let syncOngoing = false;
export const app = async (context: AppContext) => {
    const { logger } = context;

    const syncAndLog = async () => {
        if (syncOngoing) {
            logger.log("syncronization is ongoing ... skipping");
            return;
        }
        try {
            syncOngoing = true;
            logger.log("syncronization started");
            count = 0;
            const start = +new Date();
            await synchronizeData(context);
            const end = +new Date();
            logger.log(`totally synchronized ${count}`);
            logger.log(`synchronized in ${end - start} 'time': ${end - start}`);
            syncOngoing = false;
        } catch (e) {
            logger.error(e);
            throw e;
        } finally {
            syncOngoing = false;
        }
    };

    cron.schedule("00 45 */1 * * *", syncAndLog);
    logger.log(`subscribed cron events`);

    await startDummyServer();
    await syncAndLog();
};

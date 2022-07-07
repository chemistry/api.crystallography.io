import * as path from "path";
import * as fs from "fs";
import * as cron from "node-cron";
import express from "express";
import { ExecOptions, ShellString } from "shelljs";
import { Readable, Transform, TransformCallback, Writable } from "stream";

export interface AppContext {
    logger: {
        trace: (message: string) => void;
        info: (message: string) => void;
        error: (message: string) => void;
    };
    exec: (
        command: string,
        options?: ExecOptions & { async?: false }
    ) => ShellString;
    execAsync: (command: string) => Readable;
    sendToQueue: (data: object) => void;
}

export interface CodFileRecord {
    fileName: string;
    codId: string;
}

const DATA_PATH = "/home/data/cif";
const FILE_REGEX = /^\w{1}\s+(([\w\d.\/]+\/(\d+)\.cif))$/i;

let count = 0;

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

const sendInfoToConsole = () =>
    new Writable({
        objectMode: true,
        write: (chunk, _encoding, done) => {
            console.log(JSON.stringify(chunk));
            done();
        },
    });

const fetchDataFromCod = ({ logger, execAsync }: AppContext): Readable => {
    const isFirstStart = !fs.existsSync(DATA_PATH);
    const cmd =
        "rsync -av --delete rsync://www.crystallography.net/cif " + DATA_PATH;
    if (isFirstStart) {
        logger.trace("First start: initial fetching data...");
        return execAsync(cmd);
    }

    logger.trace("Update via RSYNC...");
    return execAsync(cmd);
};

const synchronizeData = (context: AppContext) => {
    const { logger, exec } = context;

    return new Promise<void>((resolve) => {
        fetchDataFromCod(context)
            .pipe(extractFileNames)
            .pipe(sendInfoToConsole())
            .on("error", (e) => {
                logger.error(String(e));
            })
            .on("end", () => {
                resolve();
            });
    });
};

export const app = async (context: AppContext) => {
    const { logger } = context;

    const syncAndLog = async () => {
        logger.info("syncronization started");
        const start = +new Date();
        await synchronizeData(context);
        const end = +new Date();
        logger.info(`synchronized in ${end - start} 'time': ${end - start}`);
    };

    const startServer = () => {
        const api = express();

        api.get("/", (_, res) => {
            fs.readdir("/data", (err, files) => {
                res.send(JSON.stringify(files));
            });
        });

        api.listen(8080);
    };

    // cron.schedule("00 45 */1 * * *", syncAndLog);
    // logger.info(`subscribed cron events`);

    startServer();
    await syncAndLog();
};

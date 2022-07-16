import { Readable } from "stream";
import * as shell from "shelljs";
import { ShellString, ExecOptions } from "shelljs";
import { app, AppContext } from "./app";
import { getChanel } from "./common/azure-service-buss-sender";
import { getLogger } from "./common/logger";

const QUEUE_NAME = "COD_FILES_CHANGED";

const getContext = async (): Promise<AppContext> => {
    const logger = await getLogger();
    const chanel = await getChanel(QUEUE_NAME);

    process.on("exit", (code) => {
        // tslint:disable-next-line
        console.log(`About to exit with code: ${code}`);
    });

    return {
        logger,
        exec: (
            command: string,
            options?: ExecOptions & { async?: false }
        ): ShellString => {
            return shell.exec(command);
        },
        execAsync: (command: string): Readable => {
            return shell.exec(command, { async: true, silent: true }).stdout;
        },
        sendMessagesToQueue: (data: object[]): Promise<void> => {
            return chanel.sendMessages(
                data.map((item) => {
                    return {
                        body: Buffer.from(JSON.stringify(item)),
                    };
                })
            );
        },
    };
};

const main = async () => {
    const context = await getContext();

    // tslint:disable-next-line
    console.time("application start");
    await app(context);

    // tslint:disable-next-line
    console.timeEnd("application start");
};

main().catch((e) => {
    // tslint:disable-next-line
    console.error(e);
    process.exit(-1);
});

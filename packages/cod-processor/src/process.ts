import { AppContext, messageProcessor } from "./app";
import { parse } from "@chemistry/cif-2-json";
import * as util from "util";
import * as fs from "fs";

export interface CodFileRecord {
    fileName: string;
    codId: string;
}

const readFile = util.promisify(fs.readFile);

export const getMessageProcessor = (context: AppContext): messageProcessor => {
    return async ({ fileName, codId }: { fileName: string; codId: string }) => {
        const { logger } = context;
        console.time("processFile");
        logger.log(`Processing fileName: ${fileName}; codId: ${codId}`);
        let fileContent = await readFile(fileName, "utf8");
        let jcif: any = parse(fileContent.toString());
        const dataNames = Object.keys(jcif);

        if (dataNames.length === 0) {
            // tslint:disable-next-line
            console.error("error while parsing processing file", fileName);
            throw new Error("wrong data format");
        }

        let dataToSave = jcif[dataNames[0]];
        const now = new Date();

        console.timeEnd("processFile");
    };
};

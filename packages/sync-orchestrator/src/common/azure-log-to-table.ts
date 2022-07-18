import * as fs from "fs";
import * as path from "path";
import { v4 as uuid } from "uuid";
import { getTableClient } from "./azure-table-storage";

export const getPackageName = () => {
    const packagePath = path.resolve(__dirname, "../../package.json");
    const packageJSON = JSON.parse(fs.readFileSync(packagePath).toString());
    return (packageJSON.name || "unknown").replace("@chemistry/", "");
};

export const getTableLogger = async () => {
    const { client } = await getTableClient("logs");

    const task = getPackageName();
    return {
        logToTable: async ({
            correlationId,
            message,
        }: {
            correlationId: string | undefined;
            message: string;
        }) => {
            await client.createEntity({
                rowKey: correlationId || uuid(),
                partitionKey: task,
                message,
            });
        },
    };
};

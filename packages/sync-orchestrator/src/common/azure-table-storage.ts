import { TableClient } from "@azure/data-tables";

export const getTableClient = async (tableName: string) => {
    const connectionString = process.env.TABLE_CONNECTION_STRING || "";

    const client = TableClient.fromConnectionString(
        connectionString,
        tableName
    );

    return {
        client,
    };
};

import { Context } from "../context";
import { mapStructure } from "./helper";

export const resolvers = {
    Query: {
        hello: () => "Hello world!",
        structure: async (
            _parent: any,
            { id }: { id: number },
            { getMongoClient }: Context
        ) => {
            const client = await getMongoClient();
            const db = client.db("crystallography");

            const structure = await db
                .collection("structures")
                .findOne({ _id: Number(id) });
            if (!structure) {
                throw new Error(`Structure ${id} not found`);
            }
            return {
                ...mapStructure(structure),
            };
        },
    },
};

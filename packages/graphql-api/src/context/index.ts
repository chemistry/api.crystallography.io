import { MongoClient } from "mongodb";

export interface Context {
    getMongoClient: () => Promise<MongoClient>;
}

let mongoClientPromise = null;
let mongoClient = null;

export const getMongoClient = async () => {
    const { MONGO_CONNECTION } = process.env;
    if (mongoClientPromise) {
        return mongoClientPromise;
    }
    if (mongoClient) {
        mongoClientPromise = null;
        return Promise.resolve(mongoClient);
    }

    const start = new Date().getTime();

    mongoClientPromise = MongoClient.connect(MONGO_CONNECTION);

    return mongoClientPromise.then((client) => {
        mongoClient = client;

        const close = () => {
            return mongoClient.close();
        };
        process.on("SIGTERM", close);

        const end = new Date().getTime();
        console.log(`MongoDB connected in ${end - start}ms`);
        return client;
    });
};

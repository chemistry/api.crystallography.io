import { ApolloServer } from "apollo-server";
import { getMongoClient } from "./context";
import { resolvers } from "./resolvers";
import { typeDefs } from "./types.graphql";

(async function start() {
    try {
        const server = new ApolloServer({
            typeDefs,
            context: { getMongoClient },
            resolvers,
            csrfPrevention: true,
            cache: "bounded",
        });

        const { url } = await server.listen(80);
        console.log(`🚀  Server ready at ${url}`);
    } catch (e) {
        console.error(e);
    }
})();

import { join } from "path";
import { DocumentNode } from "graphql";
import { ApolloServer } from "apollo-server";
import { loadTypedefsSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";

import { port } from "../consts";
import { resolvers } from "./resolvers";

const typeDefSources = loadTypedefsSync(join(__dirname, "schema.graphql"), { loaders: [new GraphQLFileLoader()] });

const server = new ApolloServer({
    typeDefs: typeDefSources.map((it) => it.document).filter(Boolean) as DocumentNode[],
    resolvers,
});

server
    .listen({ port })
    .then(({ url }) => console.log(`is running on ${url}`))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });

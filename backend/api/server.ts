import { join } from "path";
import { DocumentNode } from "graphql";
import { ApolloServer } from "apollo-server";
import { loadTypedefs } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { ValidationError } from "joi";

import { port } from "../consts";
import { resolvers } from "./resolvers";
import { createDynamicContext, createStaticContext } from "./context";
import { DescriptiveError } from "../domain/common/errors";
import { loggingPlugin } from "./logger";

const init = async () => {
    const typeDefSources = await loadTypedefs(join(__dirname, "schema.graphql"), {
        loaders: [new GraphQLFileLoader()],
    });
    const staticContext = await createStaticContext();

    const server = new ApolloServer({
        typeDefs: typeDefSources.map((it) => it.document).filter(Boolean) as DocumentNode[],
        context: createDynamicContext(staticContext),
        formatError: ({ originalError, ...existingErrorDescription }) => {
            if (originalError instanceof DescriptiveError) {
                return {
                    message: originalError.message,
                    extensions: { code: originalError.code, paths: originalError.paths },
                };
            }
            if (originalError instanceof ValidationError) {
                return {
                    message: originalError.message,
                    extensions: { code: "VALIDATION_ERROR", paths: originalError.details.map((it) => it.path).flat() },
                };
            }
            return existingErrorDescription;
        },
        plugins: [loggingPlugin(staticContext.log.child({ service: "Apollo-Server" }))],
        resolvers,
    });

    const { url } = await server.listen({ port });
    staticContext.log.info(`Server running @ ${url}`);
};

init().catch((e) => {
    console.error(e);
    process.exit(1);
});

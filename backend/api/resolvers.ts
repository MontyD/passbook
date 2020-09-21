import { Context } from "./context";
import { MutationResolvers, QueryResolvers } from "./generated/dtos";

export const resolvers: { Mutation: Required<MutationResolvers>; Query: Required<QueryResolvers> } = {
    Mutation: {
        login: (_, { email, password }, context: Context) => context.authService.login(email, password),
    },
    Query: {
        token: async () => {
            return "test";
        },
    },
};

import { Context } from "./context";
import { MutationResolvers, QueryResolvers } from "./generated/dtos";

export const resolvers: { Mutation: Required<MutationResolvers>; Query: Required<QueryResolvers> } = {
    Mutation: {
        login: (_, { email, password }, ctx: Context) => ctx.authService.login(email, password),
        refreshToken: (_, { refreshId, refreshToken }, ctx: Context) =>
            ctx.authService.refresh(refreshId, refreshToken),
    },
    Query: {
        token: async () => {
            return "test";
        },
    },
};

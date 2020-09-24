import { Context } from "./context";
import { MutationResolvers, QueryResolvers } from "./generated/dtos";

export const resolvers: { Mutation: Required<MutationResolvers>; Query: Required<QueryResolvers> } = {
    Mutation: {
        login: (_: unknown, { email, password }, ctx: Context) => ctx.authService.login(email, password),
        refreshToken: (_: unknown, { refreshId, refreshToken }, ctx: Context) =>
            ctx.authService.refresh(refreshId, refreshToken),
        createUser: (_: unknown, { userCreate }, ctx: Context) => ctx.userService.createUser(userCreate, ctx.user),
    },
    Query: {
        listUsers: (_: unknown, { offset, limit }, ctx: Context) =>
            ctx.userService.getUsers({ limit, offset }, ctx.user),
    },
};

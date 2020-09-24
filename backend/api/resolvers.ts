import { GraphQLResolveInfo } from "graphql";
import graphqlFields from "graphql-fields";
import { Context } from "./context";
import { MutationResolvers, QueryResolvers } from "./generated/dtos";

const getAttrsFromResolveInfo = (info: GraphQLResolveInfo, key?: string): any[] => {
    if (key) {
        return Object.keys(graphqlFields(info)[key]) as any[];
    }
    return Object.keys(graphqlFields(info)) as any[];
};

export const resolvers: { Mutation: Required<MutationResolvers>; Query: Required<QueryResolvers> } = {
    Mutation: {
        login: (_: unknown, { email, password }, ctx: Context) => ctx.authService.login(email, password),
        refreshToken: (_: unknown, { refreshId, refreshToken }, ctx: Context) =>
            ctx.authService.refresh(refreshId, refreshToken),
        createUser: (_: unknown, { userCreate }, ctx: Context) =>
            ctx.userService.createUser(userCreate, ctx.assertUser()),
        createOrganisation: (_: unknown, { organisationCreate }, ctx: Context) =>
            ctx.orgService.createOrganisation(organisationCreate, ctx.assertUser()),
    },
    Query: {
        listUsers: (_: unknown, { offset, limit }, ctx: Context, info) => {
            return ctx.userService.getUsers({ limit, offset }, getAttrsFromResolveInfo(info, "data"), ctx.assertUser());
        },
        listOrganisations: (_: unknown, { offset, limit }, ctx: Context, info) => {
            return ctx.orgService.getOrganisations(
                { offset, limit },
                getAttrsFromResolveInfo(info, "data"),
                ctx.assertUser()
            );
        },
    },
};

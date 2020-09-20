import { MutationResolvers, QueryResolvers } from "./generated/dtos";

export const resolvers: { Mutation: Required<MutationResolvers>; Query: Required<QueryResolvers> } = {
    Mutation: {
        login: async (parent, { email, password }) => {
            return {
                jwt: "test",
                refreshToken: "blah",
            };
        },
    },
    Query: {
        token: async () => {
            return "test";
        },
    },
};

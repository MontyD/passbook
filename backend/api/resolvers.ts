import { Resolvers } from "./generated/dtos";

export const resolvers: Resolvers = {
    Mutation: {
        login: async (parent, { email, password }) => {
            return {
                jwt: "test",
                refreshToken: "blah",
            };
        },
    },
};

import { createLogger, format, Logger, transports } from "winston";
import { Request } from "express";
import { promises as fsp } from "fs";

import { authSecretFileLocation, logLevel } from "../consts";
import { UserService } from "../domain/user/UserService";
import { PQSLUserRepository } from "../domain/user/impl/PSQLUserRepository";
import { createSequlizeInstance } from "./db";
import { AuthService } from "../domain/auth/AuthService";
import { PQSLTokenRepository } from "../domain/auth/impl/PSQLTokenRepository";
import { AuthenticatedUser } from "../domain/user/UserRepository";
import { PQSLOrganisationRepository } from "../domain/organisation/impl/PSQLOrganisationRepository";
import { OrganisationService } from "../domain/organisation/OrganisationService";

export type StaticContext = Readonly<{
    log: Logger;
    userService: UserService;
    authService: AuthService;
    orgService: OrganisationService;
}>;

export type Context = StaticContext & {
    user?: AuthenticatedUser;
};

export const createStaticContext = async (): Promise<StaticContext> => {
    const log = createLogger({
        level: logLevel,
        format: format.json(),
        transports: [new transports.Console()],
    });

    const sequelize = await createSequlizeInstance();
    const authSecret = await fsp.readFile(authSecretFileLocation, "utf-8");

    const organisationRepo = await PQSLOrganisationRepository.init(sequelize, log.child({ service: "PSQL-Org-Repo" }));
    const userRepo = await PQSLUserRepository.init(sequelize, log.child({ service: "PSQL-User-Repo" }));
    const tokenRepo = await PQSLTokenRepository.init(sequelize, log.child({ service: "PSQL-Token-Repo" }));

    await organisationRepo.initAssociations();
    await userRepo.initAssociations();
    await tokenRepo.initAssociations();

    return {
        log,
        userService: await UserService.init(userRepo, log.child({ service: "User-Service" })),
        authService: await AuthService.init(userRepo, tokenRepo, authSecret, log.child({ service: "Auth-Service" })),
        orgService: await OrganisationService.init(organisationRepo, log.child({ service: "Org-Service" })),
    };
};

const extractUserFromRequest = async ({ headers }: Request, authService: AuthService) => {
    const [_, jwtToken] = headers?.authorization?.split("Bearer ") ?? [];
    if (jwtToken) {
        return authService.verifyUserFromJWT(jwtToken);
    }
};

export const createDynamicContext = (staticContext: StaticContext) => async ({
    req,
}: {
    req: Request;
}): Promise<Context> => {
    const user = await extractUserFromRequest(req, staticContext.authService);
    return {
        ...staticContext,
        user,
    };
};

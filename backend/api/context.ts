import { createLogger, format, Logger, transports } from "winston";
import { Request } from "apollo-server";
import { promises as fsp } from "fs";
import { authSecretFileLocation, logLevel } from "../consts";
import { UserService } from "../domain/user/UserService";
import { PQSLUserRepository } from "../domain/user/impl/PSQLUserRepository";
import { createSequlizeInstance } from "./db";
import { AuthService } from "../domain/auth/AuthService";
import { PQSLTokenRepository } from "../domain/auth/impl/PSQLTokenRepository";

export type StaticContext = Readonly<{
    log: Logger;
    userService: UserService;
    authService: AuthService;
}>;

export type Context = StaticContext & {};

export const createStaticContext = async (): Promise<StaticContext> => {
    const log = createLogger({
        level: logLevel,
        format: format.json(),
        defaultMeta: { service: "api-server" },
        transports: [new transports.Console()],
    });

    const sequelize = await createSequlizeInstance();
    const authSecret = await fsp.readFile(authSecretFileLocation, "utf-8");

    const userRepo = await PQSLUserRepository.init(sequelize, log.child({ service: "PSQL-User-Repo" }));
    const tokenRepo = await PQSLTokenRepository.init(sequelize, log.child({ service: "PSQL-Token-Repo" }));

    const userService = await UserService.init(userRepo, log.child({ service: "User-Service" }));
    const authService = await AuthService.init(userRepo, tokenRepo, authSecret, log.child({ service: "Auth-Service" }));

    return {
        log,
        userService,
        authService,
    } as const;
};

export const createDynamicContext = (staticContext: StaticContext) => (request: Request) => {
    return {
        ...staticContext,
    };
};

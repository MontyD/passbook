import { createLogger, format, Logger, transports } from "winston";
import { Request } from "apollo-server";
import { logLevel } from "../consts";
import { UserService } from "../domain/user/UserService";
import { PQSLUserRepository } from "../domain/user/impl/PSQLUserRepository";
import { createSequlizeInstance } from "./db";

export type StaticContext = Readonly<{
    log: Logger;
    userService: UserService;
}>;

export const createStaticContext = async (): Promise<StaticContext> => {
    const log = createLogger({
        level: logLevel,
        format: format.json(),
        defaultMeta: { service: "api-server" },
        transports: [new transports.Console()],
    });

    const sequelize = await createSequlizeInstance();
    const userRepo = await PQSLUserRepository.init(sequelize, log.child({ service: "PQSL-User-Repo" }));
    const userService = await UserService.init(userRepo, log.child({ service: "User-Service" }));

    return {
        log,
        userService,
    } as const;
};

export const createDynamicContext = (staticContext: StaticContext) => (request: Request) => {
    return {
        ...staticContext,
    };
};

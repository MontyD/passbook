import { Logger } from "winston";
import { hash } from "bcrypt";

import { UserRepository, UserStatus } from "./UserRepository";
import { allPermissions } from "../auth/Permissions";

export class NoSuchUserException extends Error {}
export class InvalidAuthenticationDetailsException extends Error {}

export class UserService {
    public async init(userRepo: UserRepository, log: Logger) {
        const service = new UserService(userRepo, log);
        await service.performInitActions();
        return service;
    }

    private constructor(private readonly userRepo: UserRepository, private readonly log: Logger) {}

    private hashPassword(password: string) {
        return new Promise<string>((resolve, reject) => {
            hash(password, 10, (error?: Error, hashed?: string) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(hashed);
                }
            });
        });
    }

    private async performInitActions() {
        const numberOfUsers = await this.userRepo.count();
        if (numberOfUsers === 0) {
            this.log.info("No users found at UserService startup, creating default user");
            this.userRepo.createUser({
                email: "hello@montydawson.co.uk",
                password: await this.hashPassword("Password123!"),
                status: UserStatus.ACTIVE,
                permissions: allPermissions,
            });
        }
    }
}

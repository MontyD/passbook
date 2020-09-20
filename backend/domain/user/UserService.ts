import { Logger } from "winston";
import { hash } from "bcrypt";
import Joi from "joi";

import { UserCreate, UserRepository, UserStatus } from "./UserRepository";
import { allPermissions } from "../auth/Permissions";

export class NoSuchUserException extends Error {}
export class InvalidAuthenticationDetailsException extends Error {}

export class UserService {
    private userSchema = Joi.object({
        status: Joi.valid(...Object.values(UserStatus)).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).required(),
        fullName: Joi.string().required(),
        shortName: Joi.string().required(),
        permissions: Joi.object().required(),
        organisation: Joi.string().allow(null).required(),
    });

    public static async init(userRepo: UserRepository, log: Logger) {
        const service = new UserService(userRepo, log);
        await service.performInitActions();
        return service;
    }

    private constructor(private readonly userRepo: UserRepository, private readonly log: Logger) {}

    public async createUser(user: UserCreate) {
        const validatedUser: UserCreate = await this.userSchema.validateAsync(user);
        return this.userRepo.createUser(validatedUser);
    }

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
            await this.createUser({
                email: "hello@montydawson.co.uk",
                password: await this.hashPassword("Password123!"),
                fullName: "Monty Dawson",
                shortName: "Monty",
                status: UserStatus.ACTIVE,
                permissions: allPermissions,
                organisation: null,
            });
        }
    }
}

import { Logger } from "winston";
import { hash } from "bcrypt";
import Joi from "joi";

import { UserCreate, AuthenticatedUser, UserRepository, UserStatus } from "./UserRepository";
import { allPermissions, assertPermission, permissionsSchema, requiresPermission } from "../auth/Permissions";

export const userSchema = Joi.object({
    status: Joi.valid(...Object.values(UserStatus)).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
    fullName: Joi.string().required(),
    shortName: Joi.string().required(),
    permissions: permissionsSchema.required(),
    organisation: Joi.string().allow(null).required(),
});
export const authenticatedUserSchema = Joi.object({
    userId: Joi.string().required(),
    permissions: permissionsSchema.required(),
    organisation: Joi.string().allow(null).required(),
});

export class UserService {
    public static async init(userRepo: UserRepository, log: Logger) {
        const service = new UserService(userRepo, log);
        await service.performInitActions();
        return service;
    }

    private constructor(private readonly userRepo: UserRepository, private readonly log: Logger) {}

    @requiresPermission("ADMINISTER_USERS")
    public async createUser(user: UserCreate, creatingUser: AuthenticatedUser) {
        const validatedUser: UserCreate = await userSchema.validateAsync(user);
        return this.userRepo.create(validatedUser);
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
            await this.userRepo.create({
                email: "hello@montydawson.co.uk",
                password: await this.hashPassword("Password123!"),
                fullName: "Monty Dawson",
                shortName: "Monty",
                status: UserStatus.ACTIVE,
                permissions: allPermissions,
                organisation: null,
            });
            return;
        }

        const defaultUser = await this.userRepo.getByEmail("hello@montydawson.co.uk");
        if (defaultUser !== null) {
            await this.userRepo.update({ id: defaultUser.id, permissions: allPermissions });
        }
    }
}

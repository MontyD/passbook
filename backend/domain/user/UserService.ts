import { Logger } from "winston";
import { hash } from "bcrypt";
import Joi from "joi";

import { UserCreate, AuthenticatedUser, UserRepository, UserStatus, UserEntity } from "./UserRepository";
import {
    allPermissions,
    permissionsSchema,
    requiresPermission,
    AvailablePermissions,
    getPermission,
} from "../auth/Permissions";
import { PaginationOptions } from "../common/repository";
import { DescriptiveError } from "../common/errors";

export const userSchema = Joi.object({
    status: Joi.valid(...Object.values(UserStatus)).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
    fullName: Joi.string().required(),
    shortName: Joi.string().required(),
    permissions: permissionsSchema.required(),
    organisation: Joi.string(),
});
export const authenticatedUserSchema = Joi.object({
    userId: Joi.string().required(),
    permissions: permissionsSchema.required(),
    organisation: Joi.string().allow(null),
});

export class UserService {
    public static async init(userRepo: UserRepository, log: Logger) {
        const service = new UserService(userRepo, log);
        await service.performInitActions();
        return service;
    }

    private constructor(private readonly userRepo: UserRepository, private readonly log: Logger) {}

    @requiresPermission(AvailablePermissions.ADMINISTER_USERS)
    public async createUser(user: UserCreate, creatingUser: AuthenticatedUser) {
        const { all: creatingUserHasAll, organisations: creatingUserOrganisations } = getPermission(
            AvailablePermissions.ADMINISTER_USERS,
            creatingUser.permissions
        );
        const validatedUser: UserCreate = await userSchema.validateAsync({
            ...user,
            password: await hash(user.password, 10),
        });

        const hasAll = validatedUser.permissions.some((it) => it.all);
        const userPermissionOrganisations = validatedUser.permissions
            .map((it) => it.organisations)
            .filter(Boolean)
            .flat();
        if (hasAll && !creatingUserHasAll) {
            throw new DescriptiveError("PERMISSION_LEAK", "Permissions higher than current user");
        }
        if (!userPermissionOrganisations.every((it) => creatingUserOrganisations?.includes(it!))) {
            throw new DescriptiveError("PERMISSION_LEAK", "Permissions higher than current user");
        }

        return this.userRepo.create(validatedUser);
    }

    @requiresPermission(AvailablePermissions.ADMINISTER_USERS)
    public async getUsers(
        paginationOptions: PaginationOptions,
        fields?: Array<keyof UserEntity>,
        requestingUser?: AuthenticatedUser
    ) {
        const { all, organisations } = getPermission(
            AvailablePermissions.ADMINISTER_USERS,
            requestingUser!.permissions
        );
        if (all) {
            return this.userRepo.get({}, paginationOptions, fields);
        }
        if (!organisations || organisations.length === 0) {
            throw new DescriptiveError("INVALID_PERMISSIONS", "Permissions not valid to fetch users");
        }
        return this.userRepo.get({ organisation: organisations }, paginationOptions, fields);
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
            });
            return;
        }

        const defaultUser = await this.userRepo.getByEmail("hello@montydawson.co.uk");
        if (defaultUser !== null) {
            await this.userRepo.update({ id: defaultUser.id, permissions: allPermissions });
        }
    }
}

import { Permissions } from "../auth/Permissions";
import { PaginationOptions } from "../common";

export enum UserStatus {
    ACTIVE = "ACTIVE",
    EMAIL_VERIFICATION_PENDING = "EMAIL_VERIFICATION_PENDING",
    PASSWORD_FAILED = "PASSWORD_FAILED",
    LOCKED = "LOCKED",
}

export interface UserEntity {
    id: string;
    status: UserStatus;
    email: string;
    password: string;
    permissions: Permissions;
    organisation?: string;
}

export interface UserRepository {
    count(): Promise<number>;
    getById(id: string): Promise<UserEntity | null>;
    getByEmail(email: string): Promise<UserEntity | null>;
    getByOrganisation(organisation: string, paginationOptions: PaginationOptions): Promise<UserEntity[]>;

    createUser(user: Omit<UserEntity, "id">): Promise<UserEntity>;
    updateUser(user: { id: string } & Partial<UserEntity>): Promise<UserEntity>;
    deleteUser(userId: string): Promise<void>;
}

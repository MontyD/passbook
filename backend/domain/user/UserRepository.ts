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
    fullName: string;
    shortName: string;
    permissions: Permissions;
    organisation: string | null;
}

export type UserCreate = Omit<UserEntity, "id">;
export type UserUpdate = { id: string } & Partial<UserEntity>;

export interface UserRepository {
    count(): Promise<number>;
    getById(id: string): Promise<UserEntity | null>;
    getByEmail(email: string): Promise<UserEntity | null>;
    getByOrganisation(
        organisation: string,
        paginationOptions: PaginationOptions,
        fields?: Array<keyof UserEntity>
    ): Promise<UserEntity[]>;

    createUser(user: UserCreate): Promise<UserEntity>;
    updateUser(user: { id: string } & Partial<UserEntity>): Promise<UserEntity>;
    deleteUser(userId: string): Promise<void>;
}

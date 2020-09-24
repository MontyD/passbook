import { Permissions } from "../auth/Permissions";
import { Repository, Paginated } from "../common/repository";

export enum UserStatus {
    ACTIVE = "ACTIVE",
    EMAIL_VERIFICATION_PENDING = "EMAIL_VERIFICATION_PENDING",
    PASSWORD_FAILED = "PASSWORD_FAILED",
    PASSWORD_UPDATE_PENDING = "PASSWORD_UPDATE_PENDING",
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
    organisation?: string;
}

export type UserCreate = Omit<UserEntity, "id">;
export type UserUpdate = { id: string } & Partial<UserEntity>;
export type AuthenticatedUser = Pick<UserEntity, "organisation" | "permissions"> & { userId: string };

export interface UserRepository extends Repository<UserEntity, UserCreate, UserUpdate> {
    getByEmail(email: string): Promise<UserEntity | null>;
}

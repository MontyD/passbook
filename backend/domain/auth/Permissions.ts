import Joi from "joi";
import { DescriptiveError } from "../common/errors";

export enum AvailablePermissions {
    ADMINISTER_ORGANISATIONS = "ADMINISTER_ORGANISATIONS",
    ADMINISTER_LOCATIONS = "ADMINISTER_LOCATIONS",
    ADMINISTER_USERS = "ADMINISTER_USERS",
}
export type Permission = {
    name: AvailablePermissions;
    all?: boolean;
    organisations?: string[];
};
export type Permissions = Permission[];
export const allPermissions: Permissions = Object.values(AvailablePermissions).map((name) => ({ name, all: true }));

export const hasPermission = (
    requiredPermission: AvailablePermissions,
    entity?: { organisation: string | null },
    usersPermission?: Permissions
) => {
    const permissionInfo = usersPermission?.find?.((it) => it.name === requiredPermission);
    if (!permissionInfo) return false;
    if (permissionInfo.all) return true;
    if (!entity) return true;
    if (entity.organisation) {
        return permissionInfo.organisations?.includes?.(entity.organisation);
    }
    return false;
};

export const getPermission = (requiredPermission: AvailablePermissions, userPermissions: Permissions) => {
    const permission = userPermissions.find((it) => it.name === requiredPermission);
    if (!permission) {
        throw new DescriptiveError("INVALID_PERMISSION", "Unable to find relevant permission");
    }
    return permission;
};

export const assertPermission = (
    requiredPermission: AvailablePermissions,
    entity: { organisation: string | null },
    usersPermissions?: Permissions
) => {
    if (!hasPermission(requiredPermission, entity, usersPermissions)) {
        throw new DescriptiveError("UNAUTHORIZED", `User is not authorised for ${requiredPermission}`);
    }
};

export const permissionsSchema = Joi.array().items(
    Joi.object({
        name: Joi.valid(...Object.values(AvailablePermissions)).required(),
        all: Joi.bool(),
        organisation: Joi.string(),
    })
);

export function requiresPermission(
    this: any,
    permission: AvailablePermissions,
    { entityGetter, userGetter } = {
        userGetter: (args: any[]) => args[args.length - 1],
        entityGetter: (args: any[]) => args[args.length - 2],
    }
) {
    return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) {
        const original = descriptor.value;
        descriptor.value = function (...args: any[]) {
            assertPermission(permission, entityGetter(args), userGetter(args)?.permissions);
            return original?.apply(this, args);
        };
    };
}

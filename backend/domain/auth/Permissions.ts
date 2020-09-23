import Joi from "joi";
import { DescriptiveError } from "../common/errors";

export const allPermissions = {
    ADMINISTER_ORGANISATIONS: true,
    ADMINISTER_LOCATIONS: true,
    ADMINISTER_USERS: true,
} as const;

export type AvailablePermissions = keyof typeof allPermissions;
export type Permissions = { [key in AvailablePermissions]?: true | string[] };

export const hasPermission = (
    requiredPermission: AvailablePermissions,
    usersPermission: Permissions,
    entity: { organisation: string | null }
) => {
    const permissionInfo = usersPermission[requiredPermission];
    if (permissionInfo === true) {
        return true;
    }
    if (Array.isArray(permissionInfo) && entity.organisation !== null) {
        return permissionInfo.includes(entity.organisation);
    }
    return false;
};

export const assertPermission = (
    requiredPermission: AvailablePermissions,
    usersPermissions: Permissions,
    entity: { organisation: string | null }
) => {
    if (!hasPermission(requiredPermission, usersPermissions, entity)) {
        throw new DescriptiveError("UNAUTHORIZED", `User is not authorised for ${requiredPermission}`);
    }
};

export const permissionsSchema = Joi.object().pattern(/^[A-Z0-9_]*$/, Joi.allow(Joi.array().items(Joi.string()), true));

export const requiresPermission = (
    permission: AvailablePermissions,
    { entityGetter, userGetter } = {
        entityGetter: (args: any[]) => args[args.length - 2],
        userGetter: (args: any[]) => args[args.length - 1],
    }
) => (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) => {
    const original = descriptor.value;
    descriptor.value = (...args: any[]) => {
        assertPermission(permission, entityGetter(args), userGetter(args));
        return original?.apply(target, args);
    };
};

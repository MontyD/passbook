import Joi from "joi";
import { DescriptiveError } from "../common";

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

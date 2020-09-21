export class UserUnauthorizedException extends Error {
    constructor(message: string = "") {
        super(`[UserUnauthorizedException] ${message}`.trim());
    }
}

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
        throw new UserUnauthorizedException();
    }
};

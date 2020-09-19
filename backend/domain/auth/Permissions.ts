export const allPermissions = {
    VIEW_ORGANISATIONS: true,
    MANAGE_LOCATIONS: true,
} as const;

export type Permissions = { [key in keyof typeof allPermissions]?: true | string[] };

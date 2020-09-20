export interface PaginationOptions {
    offset?: number;
    limit: number;
}

export class SchemaValidationException extends Error {}

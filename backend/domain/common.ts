export interface PaginationOptions {
    offset?: number;
    limit: number;
}

export class DescriptiveError extends Error {
    constructor(code: string, message: string) {
        super(`[${code}] ${message}`);
    }
}

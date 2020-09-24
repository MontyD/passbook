export class DescriptiveError extends Error {
    constructor(public readonly code: string, message: string, public readonly paths?: string[]) {
        super(`[${code}] ${message}`);
    }
}

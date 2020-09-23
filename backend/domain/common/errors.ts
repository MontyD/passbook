export class DescriptiveError extends Error {
    constructor(public readonly code: string, message: string) {
        super(`[${code}] ${message}`);
    }
}

import { Logger } from "winston";

interface Request {
    operationName?: string;
    http?: {
        url: string;
        method: string;
    };
}

export const loggingPlugin = (log: Logger) => ({
    requestDidStart({ request: { operationName, http } }: { request: Request }) {
        log.info(`Request start operationName:${operationName} url:${http?.url} method:${http?.method}`);

        return {
            didEncounterErrors({ errors }: { errors: ReadonlyArray<Error> }) {
                log.error(`Request encountered error ${errors.map((it) => it.message).join(`, `)}`);
            },
        };
    },
});

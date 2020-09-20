export const port = parseInt(process.env.PORT ?? "8088");
export const logLevel = process.env.LOG_LEVEL ?? "debug";

export const dbConnection = {
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.PORT ?? "5432"),
    database: process.env.DB_NAME ?? "PassbookEntities",
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "test",
} as const;

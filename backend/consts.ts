export const port = parseInt(process.env.PORT ?? "8088");
export const logLevel = process.env.LOG_LEVEL ?? "debug";

export const dbConnection = {
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.PORT ?? "5432"),
    database: process.env.DB_NAME ?? "PassbookEntities",
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "test",
} as const;

export const jwtTokenExpiryLength = parseInt(process.env.JWT_TOKEN_LENGTH ?? "900000"); // 15 mins
export const refreshTokenExpiryLength = parseInt(process.env.REFRESH_TOKEN_LENGTH ?? "14400000"); // 4 hours
export const authSecretFileLocation = process.env.AUTH_SECRET_FILE_LOCATION ?? "dev-config/auth-secret";

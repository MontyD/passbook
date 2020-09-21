export class NoSuchRefreshTokenException extends Error {
    constructor(message: string = "") {
        super(`[NoSuchRefreshTokenException] ${message}`.trim());
    }
}

export interface RefreshTokenEntity {
    id: string;
    userId: string;
    token: string;
    expires: number;
}
export type RefreshTokenCreate = Omit<RefreshTokenEntity, "id">;

export interface TokenRepository {
    createRefreshToken(token: RefreshTokenCreate): Promise<RefreshTokenEntity>;
    getRefreshToken(id: string): Promise<RefreshTokenEntity | null>;
    deleteRefreshToken(id: string): Promise<void>;
}

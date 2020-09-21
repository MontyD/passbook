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
    deleteRefreshTokensForUser(userId: string): Promise<void>;
}

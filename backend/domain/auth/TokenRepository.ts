import { Repository } from "../common/repository";

export interface RefreshTokenEntity {
    id: string;
    userId: string;
    token: string;
    expires: number;
}
export type RefreshTokenCreate = Omit<RefreshTokenEntity, "id">;

export interface TokenRepository extends Repository<RefreshTokenEntity, RefreshTokenCreate, { id: string }> {
    deleteRefreshTokensForUser(userId: string): Promise<void>;
}

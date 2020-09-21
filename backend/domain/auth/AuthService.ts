import { Logger } from "winston";
import { compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { createHash } from "crypto";
import { AuthenticatedUser, UserEntity, UserRepository } from "../user/UserRepository";
import { authenticatedUserSchema } from "../user/UserService";
import { RefreshTokenCreate, TokenRepository } from "./TokenRepository";
import { jwtTokenExpiryLength, refreshTokenExpiryLength } from "../../consts";
import { DescriptiveError } from "../common";

const issuer = "passbook-auth";

export class AuthService {
    public static async init(userRepo: UserRepository, tokenRepo: TokenRepository, authSecret: string, log: Logger) {
        return new AuthService(userRepo, tokenRepo, authSecret, log);
    }

    private constructor(
        private readonly userRepo: UserRepository,
        private readonly tokenRepo: TokenRepository,
        private readonly authSecret: string,
        private readonly log: Logger
    ) {}

    public async login(email: string, password: string) {
        const user = await this.userRepo.getByEmail(email);
        if (user === null) {
            throw new DescriptiveError("NO_SUCH_USER", "User does not exist");
        }
        if (!(await compare(password, user.password))) {
            throw new DescriptiveError("INVALID_PASSWORD", "Password incorrect");
        }
        await this.tokenRepo.deleteRefreshTokensForUser(user.id);
        return this.generateTokenPayload(user);
    }

    public async verifyUserFromJWT(token: string): Promise<AuthenticatedUser | undefined> {
        let decoded: string | object | null = null;
        try {
            decoded = verify(token, this.authSecret, { issuer });
        } catch (e) {
            this.log.warn(`Token decode failed with: ${e.message}`);
        }
        if (!decoded || typeof decoded === "string") {
            return;
        }
        const { userId, organisation, permissions } = decoded as Partial<AuthenticatedUser>;
        try {
            return await authenticatedUserSchema.validateAsync({ userId, organisation, permissions });
        } catch (e) {
            this.log.warn(`Token validation failed with: ${e.message}`);
            return;
        }
    }

    public async refresh(refreshId: string, refreshToken: string) {
        const token = await this.tokenRepo.getRefreshToken(refreshId);
        if (!token || token.expires < Date.now() || token.token !== refreshToken) {
            throw new DescriptiveError("INVALID_REFRESH_TOKEN", "Refresh token not valid");
        }

        const user = await this.userRepo.getById(token.userId);
        if (!user) {
            throw new DescriptiveError("INVALID_REFRESH_TOKEN", "Refresh token not linked to a user");
        }
        await this.tokenRepo.deleteRefreshTokensForUser(user.id);
        return this.generateTokenPayload(user);
    }

    private generateJWT({ id: userId, permissions, organisation }: UserEntity) {
        return sign({ userId, permissions, organisation }, this.authSecret, {
            expiresIn: jwtTokenExpiryLength / 1000,
            issuer,
        });
    }

    private generateRefreshToken({ id: userId }: UserEntity): RefreshTokenCreate {
        return {
            userId,
            token: createHash("sha1").update(`${Date.now()}${Math.random()}`).digest("hex"),
            expires: Date.now() + refreshTokenExpiryLength,
        };
    }

    private async generateTokenPayload(user: UserEntity) {
        const jwt = this.generateJWT(user);
        const refreshToken = await this.tokenRepo.createRefreshToken(this.generateRefreshToken(user));
        return {
            jwt,
            refreshToken: {
                id: refreshToken.id,
                token: refreshToken.token,
            },
            jwtExpiresIn: jwtTokenExpiryLength,
        };
    }
}

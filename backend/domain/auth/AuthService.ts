import { Logger } from "winston";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { createHash } from "crypto";
import { UserEntity, UserRepository } from "../user/UserRepository";
import { NoSuchUserException } from "../user/UserService";
import { RefreshTokenCreate, TokenRepository } from "./TokenRepository";
import { jwtTokenExpiryLength, refreshTokenExpiryLength } from "../../consts";

const issuer = "passbook-auth";

export class InvalidPasswordException extends Error {
    constructor(message: string = "") {
        super(`[InvalidPasswordException] ${message}`.trim());
    }
}

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
            throw new NoSuchUserException();
        }
        if (!(await compare(password, user.password))) {
            throw new InvalidPasswordException();
        }
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

    private generateJWT({ id: userId, permissions }: UserEntity) {
        return sign({ userId, permissions }, this.authSecret, { expiresIn: jwtTokenExpiryLength / 1000, issuer });
    }

    private generateRefreshToken({ id: userId }: UserEntity): RefreshTokenCreate {
        return {
            userId,
            token: createHash("sha1").update(`${Date.now()}${Math.random()}`).digest("hex"),
            expires: Date.now() + refreshTokenExpiryLength,
        };
    }
}

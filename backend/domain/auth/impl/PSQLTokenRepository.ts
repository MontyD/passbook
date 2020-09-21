import { Sequelize } from "sequelize";
import { Logger } from "winston";
import { DescriptiveError } from "../../common";
import { RefreshTokenCreate, TokenRepository } from "../TokenRepository";
import { RefreshTokenModel, tokenModelFieldDefs } from "./PSQLTokenModel";

export class PQSLTokenRepository implements TokenRepository {
    public static async init(sequelize: Sequelize, log: Logger) {
        RefreshTokenModel.init(tokenModelFieldDefs, {
            sequelize,
            modelName: "Token",
        });
        await RefreshTokenModel.sync();
        return new PQSLTokenRepository(sequelize, log);
    }

    private constructor(private readonly sequelize: Sequelize, private readonly log: Logger) {}

    public createRefreshToken(refreshToken: RefreshTokenCreate) {
        return RefreshTokenModel.create(refreshToken);
    }

    public async getRefreshToken(id: string) {
        return RefreshTokenModel.findByPk(id);
    }

    public async deleteRefreshToken(id: string) {
        const numberOfDeleted = await RefreshTokenModel.destroy({ where: { id }, limit: 1 });
        if (numberOfDeleted === 0) {
            throw new DescriptiveError("NO_SUCH_TOKEN", "Token to be deleted not found");
        }
    }

    public async deleteRefreshTokensForUser(userId: string) {
        await RefreshTokenModel.destroy({ where: { userId } });
    }
}

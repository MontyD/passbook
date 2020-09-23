import { Sequelize } from "sequelize";
import { Logger } from "winston";
import { createPSQLRepository } from "../../common/impl/PSQLRepository";
import { RefreshTokenEntity, RefreshTokenCreate, TokenRepository } from "../TokenRepository";
import { RefreshTokenModel, tokenModelFieldDefs } from "./PSQLTokenModel";
import { UserModel } from "../../user/impl/PSQLUserModel";

const BasePQSLTokenRepository = createPSQLRepository<
    RefreshTokenEntity,
    RefreshTokenCreate,
    { id: string },
    RefreshTokenModel
>(RefreshTokenModel, "Token");

export class PQSLTokenRepository extends BasePQSLTokenRepository implements TokenRepository {
    public static async init(sequelize: Sequelize, log: Logger) {
        RefreshTokenModel.init(tokenModelFieldDefs, {
            sequelize,
            modelName: "Tokens",
        });
        return new PQSLTokenRepository(sequelize, log);
    }

    public async initAssociations() {
        RefreshTokenModel.belongsTo(UserModel, { foreignKey: "userId" });
        await RefreshTokenModel.sync();
    }

    public async deleteRefreshTokensForUser(userId: string) {
        await RefreshTokenModel.destroy({ where: { userId } });
    }
}

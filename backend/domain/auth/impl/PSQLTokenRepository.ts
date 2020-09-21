import { Model, DataTypes, Sequelize } from "sequelize";
import { Logger } from "winston";
import {
    RefreshTokenEntity,
    RefreshTokenCreate,
    TokenRepository,
    NoSuchRefreshTokenException,
} from "../TokenRepository";

class RefreshTokenModel extends Model<RefreshTokenEntity, RefreshTokenCreate> implements RefreshTokenEntity {
    public id!: string;
    public userId!: string;
    public token!: string;
    public expires!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

const modelFieldDefs = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expires: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
} as const;

export class PQSLTokenRepository implements TokenRepository {
    public static async init(sequelize: Sequelize, log: Logger) {
        RefreshTokenModel.init(modelFieldDefs, {
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
            throw new NoSuchRefreshTokenException();
        }
    }
}

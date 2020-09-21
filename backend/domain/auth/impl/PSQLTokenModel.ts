import { Model, DataTypes } from "sequelize";
import { RefreshTokenEntity, RefreshTokenCreate } from "../TokenRepository";

export class RefreshTokenModel extends Model<RefreshTokenEntity, RefreshTokenCreate> implements RefreshTokenEntity {
    public id!: string;
    public userId!: string;
    public token!: string;
    public expires!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export const tokenModelFieldDefs = {
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

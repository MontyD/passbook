import { Model, DataTypes } from "sequelize";
import { Permissions } from "../../auth/Permissions";
import { UserCreate, UserEntity, UserStatus } from "../UserRepository";

export class UserModel extends Model<UserEntity, UserCreate> implements UserEntity {
    public id!: string;
    public status!: UserStatus;
    public email!: string;
    public password!: string;
    public fullName!: string;
    public shortName!: string;
    public permissions!: Permissions;
    public organisation!: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export const userModelFieldDefs = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    status: {
        type: DataTypes.ENUM(...Object.values(UserStatus)),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    shortName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    permissions: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    organisation: {
        type: DataTypes.UUID,
        allowNull: true,
    },
} as const;

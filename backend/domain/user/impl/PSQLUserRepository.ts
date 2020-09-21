import { Model, DataTypes, Sequelize } from "sequelize";
import { Logger } from "winston";
import { Permissions } from "../../auth/Permissions";
import { PaginationOptions } from "../../common";
import { UserCreate, UserEntity, UserRepository, UserStatus, UserUpdate } from "../UserRepository";
import { NoSuchUserException } from "../UserService";

class UserModel extends Model<UserEntity, UserCreate> implements UserEntity {
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

const modelFieldDefs = {
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

export class PQSLUserRepository implements UserRepository {
    public static async init(sequelize: Sequelize, log: Logger) {
        UserModel.init(modelFieldDefs, {
            sequelize,
            modelName: "User",
        });
        await UserModel.sync();
        return new PQSLUserRepository(sequelize, log);
    }

    private constructor(private readonly sequelize: Sequelize, private readonly log: Logger) {}

    public count() {
        return UserModel.count();
    }

    public createUser(userCreate: UserCreate) {
        return UserModel.create(userCreate);
    }

    public async updateUser({ id, ...fieldsToUpdate }: UserUpdate) {
        const [_, updatedRecords] = await UserModel.update(fieldsToUpdate, { where: { id }, returning: true });
        if (updatedRecords.length === 0) {
            throw new NoSuchUserException();
        }
        return updatedRecords[0];
    }

    public async deleteUser(id: string) {
        const numberOfDeleted = await UserModel.destroy({ where: { id }, limit: 1 });
        if (numberOfDeleted === 0) {
            throw new NoSuchUserException();
        }
    }

    public getById(id: string) {
        return UserModel.findByPk(id);
    }

    public getByEmail(email: string) {
        return UserModel.findOne({ where: { email } });
    }

    public getByOrganisation(
        organisationId: string,
        { limit, offset }: PaginationOptions,
        fields?: Array<keyof UserEntity>
    ) {
        return UserModel.findAll({ where: { organisation: organisationId }, limit, offset, attributes: fields });
    }
}

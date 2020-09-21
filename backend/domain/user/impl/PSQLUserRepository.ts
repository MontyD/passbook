import { Sequelize } from "sequelize";
import { Logger } from "winston";
import { DescriptiveError, PaginationOptions } from "../../common";
import { UserCreate, UserEntity, UserRepository, UserUpdate } from "../UserRepository";
import { UserModel, userModelFieldDefs } from "./PSQLUserModel";

export class PQSLUserRepository implements UserRepository {
    public static async init(sequelize: Sequelize, log: Logger) {
        UserModel.init(userModelFieldDefs, {
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
            throw new DescriptiveError("NO_SUCH_USER", "User could not be found");
        }
        return updatedRecords[0];
    }

    public async deleteUser(id: string) {
        const numberOfDeleted = await UserModel.destroy({ where: { id }, limit: 1 });
        if (numberOfDeleted === 0) {
            throw new DescriptiveError("NO_SUCH_USER", "User to delete could not be found");
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

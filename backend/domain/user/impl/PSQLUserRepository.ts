import { Sequelize } from "sequelize";
import { Logger } from "winston";
import { UserCreate, UserEntity, UserUpdate, UserRepository } from "../UserRepository";
import { UserModel, userModelFieldDefs } from "./PSQLUserModel";
import { createPSQLRepository } from "../../common/impl/PSQLRepository";
import { OrganisationModel } from "../../organisation/impl/PSQLOrganisationModel";

const BasePQSLUserRepository = createPSQLRepository<UserEntity, UserCreate, UserUpdate, UserModel>(UserModel, "User");

export class PQSLUserRepository extends BasePQSLUserRepository implements UserRepository {
    public static async init(sequelize: Sequelize, log: Logger) {
        UserModel.init(userModelFieldDefs, {
            sequelize,
            modelName: "Users",
        });
        return new PQSLUserRepository(sequelize, log);
    }
    getByEmail(email: string) {
        return UserModel.findOne({ where: { email } });
    }
    async getByOrganisations(organisations: string[]) {
        const where = { organisation: organisations };
        const [total, data] = await Promise.all([UserModel.count({ where }), UserModel.findAll({ where })]);
        return { total, data };
    }
    async initAssociations() {
        UserModel.belongsTo(OrganisationModel, { foreignKey: "organisation", targetKey: "id" });
        await UserModel.sync();
    }
}

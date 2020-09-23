import { Sequelize } from "sequelize";
import { Logger } from "winston";
import { createPSQLRepository } from "../../common/impl/PSQLRepository";
import { organisationModelFieldDefs, OrganisationModel } from "./PSQLOrganisationModel";
import {
    OrganisationCreate,
    OrganisationEntity,
    OrganisationRepository,
    OrganisationUpdate,
} from "../OrganisationRepository";
import { UserModel } from "../../user/impl/PSQLUserModel";

const BasePQSLOrganisationRepository = createPSQLRepository<
    OrganisationEntity,
    OrganisationCreate,
    OrganisationUpdate,
    OrganisationModel
>(OrganisationModel, "Organisation");

export class PQSLOrganisationRepository extends BasePQSLOrganisationRepository implements OrganisationRepository {
    public static async init(sequelize: Sequelize, log: Logger) {
        OrganisationModel.init(organisationModelFieldDefs, {
            sequelize,
            modelName: "Organisations",
        });
        return new PQSLOrganisationRepository(sequelize, log);
    }

    public async initAssociations() {
        OrganisationModel.hasMany(UserModel, { foreignKey: "organisation" });
        await OrganisationModel.sync();
    }
}

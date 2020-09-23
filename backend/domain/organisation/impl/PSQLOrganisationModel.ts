import { Model, DataTypes } from "sequelize";
import { OrganisationStatus, OrganisationEntity, OrganisationCreate, DataToCapture } from "../OrganisationRepository";

export class OrganisationModel extends Model<OrganisationEntity, OrganisationCreate> implements OrganisationEntity {
    public id!: string;
    public status!: OrganisationStatus;
    public name!: string;
    public dataToCapture!: DataToCapture;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export const organisationModelFieldDefs = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    status: {
        type: DataTypes.ENUM(...Object.values(OrganisationStatus)),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dataToCapture: {
        type: DataTypes.JSON,
        allowNull: false,
    },
} as const;

import { Repository } from "../common/repository";

export enum OrganisationStatus {
    ACTIVE = "ACTIVE",
    LOCKED = "LOCKED",
}

export enum DataType {
    FREE_TEXT = "FREE_TEXT",
    EMAIL = "EMAIL",
    PHONE_NUMBER = "PHONE_NUMBER",
}

export interface DataToCapture {
    name: string;
    label: string;
    type: DataType;
}

export interface OrganisationEntity {
    id: string;
    name: string;
    status: OrganisationStatus;
    dataToCapture: DataToCapture[];
}
export type OrganisationCreate = Omit<OrganisationEntity, "id">;
export type OrganisationUpdate = Partial<OrganisationEntity> & { id: string };

export type OrganisationRepository = Repository<OrganisationEntity, OrganisationCreate, OrganisationUpdate>;

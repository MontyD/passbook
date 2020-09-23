import { Logger } from "winston";
import Joi from "joi";

import { OrganisationRepository, OrganisationStatus, OrganisationCreate, DataType } from "./OrganisationRepository";

export const dataToCaptureSchema = Joi.object().pattern(
    Joi.string(),
    Joi.object({
        label: Joi.string().required(),
        type: Joi.valid(...Object.values(DataType)).required(),
    })
);
export const organisationSchema = Joi.object({
    status: Joi.valid(...Object.values(OrganisationStatus)).required(),
    name: Joi.string().email().required(),
    dataToCapture: dataToCaptureSchema,
});

export class OrganisationService {
    public static async init(orgRepo: OrganisationRepository, log: Logger) {
        return new OrganisationService(orgRepo, log);
    }

    private constructor(private readonly orgRepo: OrganisationRepository, private readonly log: Logger) {}

    public async createOrganisation(orgCreate: OrganisationCreate) {
        return this.orgRepo.create(await organisationSchema.validateAsync(orgCreate));
    }
}

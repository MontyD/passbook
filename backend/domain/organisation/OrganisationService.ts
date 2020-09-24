import { Logger } from "winston";
import Joi from "joi";

import {
    OrganisationRepository,
    OrganisationStatus,
    OrganisationEntity,
    OrganisationCreate,
    DataType,
} from "./OrganisationRepository";
import { AuthenticatedUser } from "../user/UserRepository";
import { requiresPermission, AvailablePermissions, getPermission } from "../auth/Permissions";
import { PaginationOptions } from "../common/repository";
import { DescriptiveError } from "../common/errors";

export const dataToCaptureSchema = Joi.array().items(
    Joi.object({
        name: Joi.string().required(),
        label: Joi.string().required(),
        type: Joi.valid(...Object.values(DataType)).required(),
    })
);
export const organisationSchema = Joi.object({
    status: Joi.valid(...Object.values(OrganisationStatus)).required(),
    name: Joi.string().required(),
    dataToCapture: dataToCaptureSchema,
});

export class OrganisationService {
    public static async init(orgRepo: OrganisationRepository, log: Logger) {
        return new OrganisationService(orgRepo, log);
    }

    private constructor(private readonly orgRepo: OrganisationRepository, private readonly log: Logger) {}

    @requiresPermission(AvailablePermissions.ADMINISTER_ORGANISATIONS)
    public async createOrganisation(orgCreate: Omit<OrganisationCreate, "status">, requestingUser: AuthenticatedUser) {
        return this.orgRepo.create(
            await organisationSchema.validateAsync({ ...orgCreate, status: OrganisationStatus.ACTIVE })
        );
    }

    @requiresPermission(AvailablePermissions.ADMINISTER_ORGANISATIONS)
    public async getOrganisations(
        paginationOptions: PaginationOptions,
        fields?: Array<keyof OrganisationEntity>,
        requestingUser?: AuthenticatedUser
    ) {
        const { all, organisations } = getPermission(
            AvailablePermissions.ADMINISTER_ORGANISATIONS,
            requestingUser!.permissions
        );
        if (all) {
            return this.orgRepo.get({}, paginationOptions, fields);
        }
        if (!organisations || organisations.length === 0) {
            throw new DescriptiveError("INVALID_PERMISSIONS", "Permissions not valid to fetch users");
        }
        return this.orgRepo.get({ id: organisations }, paginationOptions, fields);
    }
}

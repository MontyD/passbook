import {
    Sequelize,
    Model,
    ModelStatic,
    CountOptions,
    CreateOptions,
    UpdateOptions,
    DestroyOptions,
    FindOptions,
    UniqueConstraintError,
} from "sequelize";
import { Logger } from "winston";
import { PaginationOptions, Repository } from "../repository";
import { DescriptiveError } from "../../common/errors";

type EntityStatic<T extends TCreate, TCreate extends {}, M extends Model<T, TCreate> & T> = ModelStatic<M> & {
    sync: () => Promise<Model>;
    count: (options?: CountOptions<T>) => Promise<number>;
    create: (values?: TCreate, options?: CreateOptions<T>) => Promise<M>;
    update: (values: Partial<T>, options: UpdateOptions<T>) => Promise<[number, ReadonlyArray<M>]>;
    destroy: (options?: DestroyOptions<T>) => Promise<number>;
    findAll: (options?: FindOptions<T>) => Promise<M[]>;
    findByPk: (pk: string) => Promise<M | null>;
};

export const createPSQLRepository = <
    T extends TCreate & { id: string },
    TCreate extends {},
    TUpdate extends Partial<T> & { id: string },
    M extends Model<T, TCreate> & T
>(
    EntityClass: EntityStatic<T, TCreate, M>,
    modelName: string
) => {
    return class PQSLRepository implements Repository<T, TCreate, TUpdate> {
        protected constructor(private readonly sequelize: Sequelize, private readonly log: Logger) {}

        public async initAssociations(): Promise<void> {
            this.log.info(`Default init associations called without being implemented`);
            await EntityClass.sync();
        }

        public count(where?: Partial<T>) {
            return EntityClass.count({ where });
        }

        public async create(entityToCreate: TCreate) {
            try {
                return await EntityClass.create(entityToCreate);
            } catch (e) {
                if (e instanceof UniqueConstraintError) {
                    throw new DescriptiveError(
                        "UNIQUE_VALIDATION_ERROR",
                        e.errors.map((it) => it.message).join(", "),
                        e.errors.map((it) => it.path)
                    );
                }
                console.log(e);
                throw e;
            }
        }

        public async update({ id, ...fieldsToUpdate }: TUpdate) {
            const [_, updatedRecords] = await EntityClass.update(fieldsToUpdate as any, {
                where: { id },
                returning: true,
            });
            if (updatedRecords.length === 0) {
                throw new DescriptiveError("NO_SUCH_ENTITY", `${modelName} could not be found`);
            }
            return updatedRecords[0];
        }

        public async delete(id: string) {
            const numberOfDeleted = await EntityClass.destroy({ where: { id }, limit: 1 });
            if (numberOfDeleted === 0) {
                throw new DescriptiveError("NO_SUCH_ENTITY", `${modelName} to delete could not be found`);
            }
        }

        public async get(where: Partial<T>, { limit, offset }: PaginationOptions, fields?: ReadonlyArray<keyof T>) {
            const [total, data] = await Promise.all([
                EntityClass.count({ where }),
                EntityClass.findAll({ where, limit, offset, attributes: fields as any }),
            ]);
            return {
                total,
                data,
            };
        }

        public getById(id: string) {
            return EntityClass.findByPk(id);
        }
    };
};

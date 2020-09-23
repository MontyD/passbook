export interface PaginationOptions {
    offset?: number;
    limit: number;
}

export interface Paginated<T> {
    total: number;
    data: T[];
}

export interface Repository<
    T extends TCreate & { id: string },
    TCreate extends {},
    TUpdate extends Partial<T> & { id: string }
> {
    getById(id: string): Promise<T | null>;
    get(
        query: Partial<T>,
        paginationOptions: PaginationOptions,
        fields?: ReadonlyArray<keyof T>
    ): Promise<Paginated<T>>;
    count(query?: Partial<T>): Promise<number>;

    create(entityCreate: TCreate): Promise<T>;
    update(entityToUpdate: { id: string } & TUpdate): Promise<T>;
    delete(id: string): Promise<void>;
}

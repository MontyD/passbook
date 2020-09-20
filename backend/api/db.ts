import { Sequelize } from "sequelize";
import { Client } from "pg";
import { dbConnection, logLevel } from "../consts";

export const createSequlizeInstance = async () => {
    const client = new Client({
        host: dbConnection.host,
        port: dbConnection.port,
        user: dbConnection.user,
        password: dbConnection.password,
    });
    await client.connect();
    try {
        await client.query(`CREATE DATABASE "${dbConnection.database}";`);
    } catch (e) {
        // will fail if database already exists - ignore in this case
    }
    await client.end();

    const sequelize = new Sequelize(dbConnection.database, dbConnection.user, dbConnection.password, {
        host: dbConnection.host,
        port: dbConnection.port,
        dialect: "postgres",
        logging: logLevel === "trace",
    });
    await sequelize.authenticate();
    return sequelize;
};

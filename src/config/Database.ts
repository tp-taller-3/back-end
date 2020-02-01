import { Sequelize } from "sequelize-typescript";
import Environment from "./Environment";
import databaseJSON from "../../config/database.json";
import { models } from "../models";

export default class Database {
  public static sequelize: Sequelize;

  public static close() {
    this.sequelize?.close();
  }

  public static transaction() {
    return this.sequelize?.transaction();
  }

  public static setConnection() {
    const config = databaseJSON[Environment.NODE_ENV];
    if (config.use_env_variable) {
      this.sequelize = new Sequelize(Environment.DATABASE_URL, config);
    } else {
      this.sequelize = new Sequelize(config.database, config.username, config.password, config);
    }
    this.sequelize.addModels(models);
  }
}

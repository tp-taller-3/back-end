import { QueryInterface } from "sequelize";

const TABLE_NAME = "Users";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeConstraint(TABLE_NAME, "Users_email_unique", { transaction });
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.addConstraint(TABLE_NAME, ["email"], { type: "unique", transaction });
    });
  }
};

import { QueryInterface } from "sequelize";
import { noop } from "lodash";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.dropTable("Departments", { transaction });
      await queryInterface.dropTable("Surveys", { transaction });
    });
  },
  down: noop
};

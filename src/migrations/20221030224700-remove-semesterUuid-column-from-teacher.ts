import { QueryInterface } from "sequelize";
import { noop } from "lodash";

const TABLE_NAME = "Teachers";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn(TABLE_NAME, "semesterUuid", { transaction });
    });
  },
  down: noop
};

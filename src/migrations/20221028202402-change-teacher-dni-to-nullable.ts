import { QueryInterface, INTEGER } from "sequelize";
import { noop } from "lodash";

const TABLE_NAME = "Teachers";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn(TABLE_NAME, "dni", { transaction });

      await queryInterface.addColumn(
        TABLE_NAME,
        "dni",
        {
          allowNull: true,
          type: INTEGER
        },
        { transaction }
      );
    });
  },
  down: noop
};

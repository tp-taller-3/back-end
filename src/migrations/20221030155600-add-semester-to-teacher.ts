import { QueryInterface, UUID } from "sequelize";
import { noop } from "lodash";

const TABLE_NAME = "Teachers";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.addColumn(
        TABLE_NAME,
        "semesterUuid",
        {
          allowNull: false,
          type: UUID,
          references: { model: "Semesters", key: "uuid" }
        },
        { transaction }
      );
    });
  },
  down: noop
};

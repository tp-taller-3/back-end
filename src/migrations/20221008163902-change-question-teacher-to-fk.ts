import { QueryInterface, UUID } from "sequelize";
import { noop } from "lodash";

const TABLE_NAME = "Questions";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn(TABLE_NAME, "teacherName", { transaction });

      await queryInterface.addColumn(
        TABLE_NAME,
        "teacherUuid",
        {
          allowNull: true,
          type: UUID,
          references: { model: "Teachers", key: "uuid" }
        },
        { transaction }
      );
    });
  },
  down: noop
};

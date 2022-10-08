import { QueryInterface, UUID } from "sequelize";
import { noop } from "lodash";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn("Courses", "departmentUuid", { transaction });
      await queryInterface.removeColumn("Courses", "leadDNI", { transaction });

      await queryInterface.addColumn(
        "Courses",
        "semesterUuid",
        {
          allowNull: false,
          type: UUID,
          references: { model: "Semesters", key: "uuid" }
        },
        { transaction }
      );
      await queryInterface.addColumn(
        "Teachers",
        "courseUuid",
        {
          allowNull: true,
          type: UUID,
          references: { model: "Courses", key: "uuid" }
        },
        { transaction }
      );
    });
  },
  down: noop
};

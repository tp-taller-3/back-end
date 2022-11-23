import { QueryInterface } from "sequelize";
import { noop } from "lodash";

const TABLE_NAME = "Questions";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeConstraint(
        TABLE_NAME,
        "Departments_courseUuid_questionText_unique",
        { transaction }
      );

      await queryInterface.addConstraint(
        TABLE_NAME,
        ["courseUuid", "teacherUuid", "questionText"],
        {
          type: "unique",
          name: "Departments_courseUuid_teacherUuid_questionText_unique",
          transaction
        }
      );
    });
  },
  down: noop
};

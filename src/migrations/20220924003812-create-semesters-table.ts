import { QueryInterface, DATE, INTEGER, UUID } from "sequelize";

const TABLE_NAME = "Semesters";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        TABLE_NAME,
        {
          uuid: {
            allowNull: false,
            primaryKey: true,
            type: UUID
          },
          year: {
            allowNull: false,
            type: INTEGER
          },
          semesterNumber: {
            allowNull: false,
            type: INTEGER
          },
          createdAt: {
            allowNull: false,
            type: DATE
          },
          updatedAt: {
            allowNull: false,
            type: DATE
          }
        },
        { transaction }
      );

      await queryInterface.addConstraint(TABLE_NAME, ["year", "semesterNumber"], {
        type: "unique",
        name: "Departments_year_semesterNumber_unique",
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};

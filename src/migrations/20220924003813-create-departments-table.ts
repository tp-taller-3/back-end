import { DATE, INTEGER, QueryInterface, TEXT, UUID } from "sequelize";

const TABLE_NAME = "Departments";

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
          name: {
            allowNull: false,
            type: TEXT
          },
          leadDNI: {
            allowNull: false,
            type: INTEGER
          },
          semesterUuid: {
            allowNull: false,
            type: UUID,
            references: { model: "Semesters", key: "uuid" }
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

      await queryInterface.addConstraint(TABLE_NAME, ["semesterUuid", "name"], {
        type: "unique",
        name: "Departments_semesterUuid_name_unique",
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};

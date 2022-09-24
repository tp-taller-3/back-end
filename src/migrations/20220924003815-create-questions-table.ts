import { BOOLEAN, DATE, QueryInterface, TEXT, UUID } from "sequelize";

const TABLE_NAME = "Questions";

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
          isPublic: {
            allowNull: false,
            type: BOOLEAN
          },
          questionText: {
            allowNull: false,
            type: TEXT
          },
          category: {
            allowNull: false,
            type: TEXT
          },
          teacherName: {
            allowNull: true,
            type: TEXT
          },
          courseUuid: {
            allowNull: false,
            type: UUID,
            references: { model: "Courses", key: "uuid" }
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

      await queryInterface.addConstraint(TABLE_NAME, ["courseUuid", "questionText"], {
        type: "unique",
        name: "Departments_courseUuid_questionText_unique",
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};

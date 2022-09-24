import { DATE, INTEGER, QueryInterface, TEXT, UUID } from "sequelize";

const TABLE_NAME = "Answers";

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
          value: {
            allowNull: false,
            type: TEXT
          },
          count: {
            allowNull: false,
            type: INTEGER
          },
          questionUuid: {
            allowNull: false,
            type: UUID,
            references: { model: "Questions", key: "uuid" }
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

      await queryInterface.addConstraint(TABLE_NAME, ["questionUuid", "value"], {
        type: "unique",
        name: "Departments_questionUuid_value_unique",
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};

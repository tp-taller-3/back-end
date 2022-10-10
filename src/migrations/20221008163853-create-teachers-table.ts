import { DATE, UUID, QueryInterface, TEXT, INTEGER } from "sequelize";
import { noop } from "lodash";

const TABLE_NAME = "Teachers";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.sequelize.transaction(async transaction => {
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
          role: {
            allowNull: false,
            type: "teacherRole"
          },
          fullName: {
            allowNull: false,
            type: TEXT
          },
          dni: {
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
          },
          deletedAt: {
            allowNull: true,
            type: DATE
          }
        },
        { transaction }
      );
    }),
  down: noop
};

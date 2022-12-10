import { QueryInterface } from "sequelize";

const TABLE_NAME = "Answers";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.addIndex(TABLE_NAME, ["questionUuid", "value"]),
  down: (queryInterface: QueryInterface) =>
    queryInterface.removeIndex(TABLE_NAME, "answers_question_uuid_value")
};

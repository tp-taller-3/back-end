import { QueryInterface } from "sequelize";

const TABLE_NAME = "Courses";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.addIndex(TABLE_NAME, ["semesterUuid", "name"]),
  down: (queryInterface: QueryInterface) =>
    queryInterface.removeIndex(TABLE_NAME, "courses_semester_uuid_name")
};

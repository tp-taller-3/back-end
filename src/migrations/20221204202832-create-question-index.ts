import { QueryInterface } from "sequelize";

const TABLE_NAME = "Questions";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.addIndex(TABLE_NAME, ["questionText", "category", "teacherUuid", "courseUuid"]),
  down: (queryInterface: QueryInterface) =>
    queryInterface.removeIndex(
      TABLE_NAME,
      "questions_question_text_category_teacher_uuid_course_uuid"
    )
};

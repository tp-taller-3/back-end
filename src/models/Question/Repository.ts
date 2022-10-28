import { Question } from "./Model";
import { QueryTypes } from "sequelize";
import { Database } from "$config";
import { Transaction } from "sequelize";
import { Teacher } from "$models/Teacher";
import { Course } from "$models/Course";

export const QuestionRepository = {
  findByCourseUuid: ({
    courseUuid,
    currentUserDNI
  }: {
    courseUuid: string;
    currentUserDNI?: string | null;
  }) =>
    Database.sequelize.query(
      `
          SELECT DISTINCT ON ("uuid") "Question".*
          FROM "Questions" AS "Question"
            LEFT OUTER JOIN "Teachers" AS "QuestionTeacher" ON "Question"."teacherUuid" = "QuestionTeacher"."uuid"
            LEFT OUTER JOIN "Courses" ON "Courses"."uuid" = "Question"."courseUuid"
            LEFT OUTER JOIN "Teachers" AS "CourseTeacher" ON "Courses"."uuid" = "CourseTeacher"."courseUuid"
          WHERE (
            "Question"."isPublic" = true
              ${
                currentUserDNI
                  ? `
                  OR "QuestionTeacher"."dni" = '${currentUserDNI}'
                  OR ("CourseTeacher"."role" = 'jtp' AND "CourseTeacher"."dni" = '${currentUserDNI}' AND "QuestionTeacher"."role" = 'ayudante')
                  OR ("CourseTeacher"."role" = 'titular' AND "CourseTeacher"."dni" = '${currentUserDNI}')
                `
                  : ""
              }
          ) AND "Question"."courseUuid" = :courseUuid
      `,
      {
        replacements: { courseUuid },
        type: QueryTypes.SELECT,
        model: Question,
        mapToModel: true
      }
    ),
  save: (question: Question, transaction?: Transaction) => question.save({ transaction }),
  findByCourseTeacherCategoryAndQuestionText: async (
    questionText: string,
    category: string,
    teacher: Teacher,
    course: Course
  ) =>
    Question.findOne({
      where: {
        questionText: questionText,
        category: category,
        teacherUuid: teacher.uuid,
        courseUuid: course.uuid
      }
    }),
  deleteById: (uuid: string) => Question.destroy({ where: { uuid: uuid } })
};

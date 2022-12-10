import { Question } from "./Model";
import { QueryTypes } from "sequelize";
import { Database } from "$config";
import { Transaction } from "sequelize";
import { TeacherRole } from "$models/TeacherRole";

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
                  OR ("CourseTeacher"."role" = '${TeacherRole.jtp}' AND "CourseTeacher"."dni" = '${currentUserDNI}' AND "QuestionTeacher"."role" IN ('${TeacherRole.ayudante}'))
                  OR ("CourseTeacher"."role" = '${TeacherRole.adjunto}' AND "CourseTeacher"."dni" = '${currentUserDNI}' AND "QuestionTeacher"."role" IN ('${TeacherRole.ayudante}', '${TeacherRole.jtp}'))
                  OR ("CourseTeacher"."role" = '${TeacherRole.asociado}' AND "CourseTeacher"."dni" = '${currentUserDNI}' AND "QuestionTeacher"."role" IN ('${TeacherRole.ayudante}', '${TeacherRole.jtp}', '${TeacherRole.adjunto}'))
                  OR ("CourseTeacher"."role" = '${TeacherRole.titular}' AND "CourseTeacher"."dni" = '${currentUserDNI}')
                  OR EXISTS (SELECT 1 FROM "Admins" INNER JOIN "Users" ON "Admins"."userUuid" = "Users"."uuid" WHERE "Users"."dni" = '${currentUserDNI}')
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
  deleteBySemesterUuid: (semesterUuid: string, transaction: Transaction) => {
    Database.sequelize.query(
      `
        DELETE
        FROM "Questions" 
        WHERE "Questions"."courseUuid" IN (SELECT "Courses"."uuid"
                                           FROM "Courses" 
                                           WHERE "Courses"."semesterUuid" = '${semesterUuid}')
      `,
      {
        type: QueryTypes.DELETE,
        model: Question,
        transaction: transaction
      }
    );
  },
  save: (question: Question, transaction?: Transaction) => question.save({ transaction }),
  findByCourseTeacherCategoryAndQuestionText: async (
    questionText: string,
    category: string,
    teacherUuid: string | null,
    courseUuid: string
  ) =>
    Question.findOne({
      where: {
        questionText: questionText,
        category: category,
        teacherUuid: teacherUuid,
        courseUuid: courseUuid
      }
    }),
  findByCourseCategoryAndQuestionText: async (
    questionText: string,
    category: string,
    courseUuid: string
  ) =>
    Question.findOne({
      where: {
        questionText: questionText,
        category: category,
        courseUuid: courseUuid
      }
    }),
  deleteById: (uuid: string) => Question.destroy({ where: { uuid: uuid } })
};

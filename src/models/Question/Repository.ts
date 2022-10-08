import { Question } from "./Model";
import { QueryTypes } from "sequelize";
import { Database } from "$config";

export const QuestionRepository = {
  findByCourseUuid: ({
    courseUuid,
    currentUserDNI
  }: {
    courseUuid: string;
    currentUserDNI?: string | null;
  }) => {
    const dniClause = currentUserDNI ? `= '${currentUserDNI}'` : "IS NULL";

    return Database.sequelize.query(
      `
          SELECT DISTINCT ON ("uuid") "Question".*
          FROM "Questions" AS "Question"
            LEFT OUTER JOIN "Teachers" AS "QuestionTeacher" ON "Question"."teacherUuid" = "QuestionTeacher"."uuid"
            LEFT OUTER JOIN "Courses" ON "Courses"."uuid" = "Question"."courseUuid"
            LEFT OUTER JOIN "Teachers" AS "CourseTeacher" ON "Courses"."uuid" = "CourseTeacher"."courseUuid"
          WHERE (
            "Question"."isPublic" = true
              OR "QuestionTeacher"."dni" ${dniClause}
              OR ("CourseTeacher"."role" = 'jtp' AND "CourseTeacher"."dni" ${dniClause} AND "QuestionTeacher"."role" = 'ayudante')
              OR ("CourseTeacher"."role" = 'titular' AND "CourseTeacher"."dni" ${dniClause})
          ) AND "Question"."courseUuid" = :courseUuid
      `,
      {
        replacements: { courseUuid },
        type: QueryTypes.SELECT,
        model: Question,
        mapToModel: true
      }
    );
  }
};

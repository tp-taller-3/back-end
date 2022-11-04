import { Database } from "$config/Database";
import { Course } from "$models/Course";
import { QueryTypes, Transaction } from "sequelize";
import { Teacher } from "./Model";

export const TeacherRepository = {
  save: (teacher: Teacher, transaction?: Transaction) => teacher.save({ transaction }),
  findByFullNameAndCourseUuidIfExists: async (fullName: string, courseUuid: string) =>
    Teacher.findOne({ where: { fullName: fullName, courseUuid: courseUuid } }),
  deleteById: (uuid: string) => Teacher.destroy({ where: { uuid: uuid } }),
  deleteBySemesterUuid: (semesterUuid: string, transaction: Transaction) =>
    Database.sequelize.query(
      `
        DELETE
        FROM "Teachers" 
        WHERE "Teachers"."courseUuid" IN (SELECT "Courses"."uuid"
                                          FROM "Courses" 
                                          WHERE "Courses"."semesterUuid" = '${semesterUuid}')
      `,
      {
        type: QueryTypes.DELETE,
        model: Teacher,
        transaction: transaction
      }
    ),
  findByFullNameAndSemesterUuid: async (fullName: string, semesterUuid: string) =>
    Teacher.findOne({
      where: { fullName: fullName },
      include: [{ model: Course, where: { semesterUuid: semesterUuid } }]
    })
};

import { Transaction } from "sequelize";
import { Course } from "..";

export const CourseRepository = {
  save: (course: Course, transaction?: Transaction) => course.save({ transaction }),
  findBySemesterUuid: ({ semesterUuid }: { semesterUuid: string }) =>
    Course.findAll({ where: { semesterUuid } }),
  findByCourseNameIfExists: async (name: string) => Course.findOne({ where: { name: name } }),
  deleteById: (uuid: string) => Course.destroy({ where: { uuid: uuid } }),
  deleteBySemesterUuid: (semesterUuid: string, transaction: Transaction) =>
    Course.destroy({ where: { semesterUuid: semesterUuid }, transaction: transaction })
};

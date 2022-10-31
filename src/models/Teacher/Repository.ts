import { Transaction } from "sequelize";
import { Teacher } from "./Model";

export const TeacherRepository = {
  save: (teacher: Teacher, transaction?: Transaction) => teacher.save({ transaction }),
  findByFullNameIfExists: async (fullName: string) =>
    Teacher.findOne({ where: { fullName: fullName } }),
  deleteById: (uuid: string) => Teacher.destroy({ where: { uuid: uuid } }),
  deleteBySemesterUuid: (semesterUuid: string, transaction: Transaction) =>
    Teacher.destroy({ where: { semesterUuid: semesterUuid }, transaction: transaction })
};

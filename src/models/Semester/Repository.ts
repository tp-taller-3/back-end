import { Transaction } from "sequelize";
import { Semester } from "..";

export const SemesterRepository = {
  save: (semester: Semester, transaction?: Transaction) => semester.save({ transaction }),
  findByYearAndSemesterNumber: async (year: number, semesterNumber: number) =>
    Semester.findOne({ where: { year: year, semesterNumber: semesterNumber } }),
  findAll: () => Semester.findAll(),
  deleteById: (uuid: string) => Semester.destroy({ where: { uuid: uuid } })
};

import { Transaction } from "sequelize";
import { Semester } from "..";
import { SemesterNotFound } from "./Errors/SemesterNotFound";

export const SemesterRepository = {
  save: (semester: Semester, transaction?: Transaction) => semester.save({ transaction }),
  findByYearAndSemesterNumber: async (year: number, semesterNumber: number) =>
    Semester.findOne({ where: { year: year, semesterNumber: semesterNumber } }),
  findAll: () => Semester.findAll(),
  findByUuid: async (uuid: string) => {
    const semester = await Semester.findByPk(uuid);
    if (!semester) throw new SemesterNotFound(uuid);
    return semester;
  },
  deleteById: (uuid: string, transaction?: Transaction) =>
    Semester.destroy({ where: { uuid: uuid }, transaction: transaction })
};

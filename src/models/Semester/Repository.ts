import { Transaction } from "sequelize";
import { Semester } from "..";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { PaginationQuery } from "$models/PaginationQuery";
import { SemesterNotFound } from "./Errors/SemesterNotFound";

export const SemesterRepository = {
  findAll: () => Semester.findAll(),
  findLatest: (updatedBeforeThan?: IPaginatedInput) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      query: options => Semester.findAll({ ...options })
    }),
  findBySemesterUuid: async (SemesterUuid: string) => {
    const semester = await Semester.findByPk(SemesterUuid);
    if (!semester) throw new SemesterNotFound(SemesterUuid);

    return semester;
  },
  delete: (semester: Semester) => semester.destroy(),
  save: (semester: Semester, transaction?: Transaction) => semester.save({ transaction }),
  findByYearAndSemesterNumber: async (year: number, semesterNumber: number) =>
    Semester.findOne({ where: { year: year, semesterNumber: semesterNumber } }),
  findByUuid: async (uuid: string) => {
    const semester = await Semester.findByPk(uuid);
    if (!semester) throw new SemesterNotFound(uuid);
    return semester;
  },
  deleteById: (uuid: string, transaction?: Transaction) =>
    Semester.destroy({ where: { uuid: uuid }, transaction: transaction })
};
